import { Elysia } from 'elysia';
import {
  registerBodySchema,
  verifySubmitBodySchema,
} from '~/models/auth/register';
import { createId } from '@paralleldrive/cuid2';
import { db } from '~/database/db';
import { accounts, emailAuth, passwordAuth, sessions } from '~/database/schema';
import { lucia } from '~/auth';
import { eq, and, gt } from 'drizzle-orm';
import { createVerificationCode } from '~/util';
import { addHours } from 'date-fns/fp';
import auth from '~/middleware/auth';
import '~/auth';
import { mailer } from '~/mailer';

export default new Elysia()
  .post(
    '/register',
    async ({ cookie, body }) => {
      const user = await db.query.accounts.findFirst({
        where: eq(accounts.email, body.email),
      });
      if (user) {
        throw new Error('Email already registered');
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
  )
  .use(auth)
  .get('/verify-request', async ({ user, cookie }) => {
    if (!user) {
      throw new Error('Must be logged in');
    }
    if (user.verified) {
      throw new Error('User already verified');
    }
    const code = createVerificationCode();
    await db.insert(emailAuth).values({
      userId: user.id,
      code,
      expiresAt: addHours(1, new Date()),
    });
    await mailer.sendMail({
      to: user.email,
      subject: `Your verification code is ${code}`,
      templateName: 'otp',
      templateData: {
        title: 'Welcome to OSU Courses API',
        message:
          'Please verify your email with the code below to complete account setup.',
        warning:
          "If you didn't request this code, you can safely ignore this email.",
        codeGroup1: code.substring(0, 3),
        codeGroup2: code.substring(3),
      },
    });
  })
  .post(
    '/verify-submit',
    async ({ user, body: { code }, cookie }) => {
      if (!user) {
        throw new Error('Must be logged in');
      }
      if (user.verified) {
        throw new Error('User already verified');
      }
      const verifyToken = await db.query.emailAuth.findFirst({
        where: and(
          eq(emailAuth.userId, user.id),
          eq(emailAuth.code, code),
          gt(sessions.expiresAt, new Date())
        ),
      });
      if (!verifyToken) {
        throw new Error('Invalid code');
      }
      db.update(accounts).set({ verified: true });
      db.delete(emailAuth).where(eq(emailAuth.id, verifyToken.id));
    },
    {
      body: verifySubmitBodySchema,
    }
  );
