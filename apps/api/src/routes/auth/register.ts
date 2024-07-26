import { Elysia } from 'elysia';
import { registerBodySchema } from '~/models/auth/register';
import { createId } from '@paralleldrive/cuid2';
import { db } from '~/database/db';
import { accounts, passwordAuth } from '~/database/schema';
import { lucia } from '~/auth';
import { eq } from 'drizzle-orm';

export default new Elysia().post(
  '/register',
  async ({ cookie, body }) => {
    const user = await db.query.accounts.findFirst({
      where: eq(accounts.email, body.email),
    });
    if (user) {
      throw new Error('Email already exists');
    }

    const userId = createId();
    const passwordHash = await Bun.password.hash(body.password, {
      algorithm: 'argon2id',
      memoryCost: 19456,
      timeCost: 2,
    });
    await db.transaction(async (txn) => {
      await txn.insert(accounts).values({
        id: userId,
        ...body,
      });
      await txn.insert(passwordAuth).values({
        userId,
        hash: passwordHash,
      });
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookie[sessionCookie.name].set({
      value: sessionCookie.value,
      ...sessionCookie.attributes,
    });
  },
  {
    body: registerBodySchema,
  }
);
