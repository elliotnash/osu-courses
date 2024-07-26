import { Elysia } from 'elysia';
import { db } from '~/database/db';
import { accounts, passwordAuth } from '~/database/schema';
import { lucia } from '~/auth';
import { loginBodySchema } from '~/models/auth/login';
import { eq } from 'drizzle-orm';
import { hashAlgo } from '~/consts';

export default new Elysia().post(
  '/login',
  async ({ cookie, body }) => {
    const user = await db.query.accounts.findFirst({
      where: eq(accounts.email, body.email),
    });
    if (!user) {
      throw new Error("User doesn't exist");
    }

    const password = await db.query.passwordAuth.findFirst({
      where: eq(passwordAuth.userId, user.id),
    });
    if (!password) {
      throw new Error('User has no password set');
    }

    const validPassword = await Bun.password.verify(
      body.password,
      password.hash,
      hashAlgo.algorithm
    );

    if (!validPassword) {
      throw new Error('Invalid password');
    }

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookie[sessionCookie.name].set({
      value: sessionCookie.value,
      ...sessionCookie.attributes,
    });
  },
  {
    body: loginBodySchema,
  }
);
