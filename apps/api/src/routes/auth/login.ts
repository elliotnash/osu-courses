import { Elysia, NotFoundError } from 'elysia';
import { db } from '~/database/db';
import { accounts, loginTokens, passwordAuth } from '~/database/schema';
import { lucia } from '~/auth';
import { initiateLoginBodySchema, loginBodySchema } from '~/models/auth/login';
import { eq } from 'drizzle-orm';
import { hashAlgo } from '~/consts';
import { createId } from '@paralleldrive/cuid2';
import { createToken } from '~/util';
import { addMinutes } from 'date-fns/fp';
import { InvalidCredentialsError, PasswordResetRequiredError } from '~/errors';

export default new Elysia()
  .post(
    '/initiate-login',
    async ({ body }) => {
      const user = await db.query.accounts.findFirst({
        where: eq(accounts.email, body.email),
      });
      if (!user) {
        throw new InvalidCredentialsError();
      }

      const password = await db.query.passwordAuth.findFirst({
        where: eq(passwordAuth.userId, user.id),
      });
      if (!password) {
        throw new PasswordResetRequiredError();
      }

      const validPassword = await Bun.password.verify(
        body.password,
        password.hash,
        hashAlgo.algorithm
      );
      if (!validPassword) {
        throw new InvalidCredentialsError();
      }

      const id = createId();
      const token = createToken();
      await db.insert(loginTokens).values({
        id,
        userId: user.id,
        token: await Bun.password.hash(token, hashAlgo),
        expiresAt: addMinutes(15, new Date()),
      });
      return { id, token };
    },
    {
      body: initiateLoginBodySchema,
    }
  )
  .post('/send-code', async () => {})
  .post(
    '/login',
    async ({ cookie, body }) => {
      const loginToken = await db.query.loginTokens.findFirst({
        where: eq(loginTokens.id, body.id),
      });
      if (!loginToken) {
        throw new InvalidCredentialsError('Invalid login token!');
      }

      const validToken = await Bun.password.verify(
        body.token,
        loginToken.token
      );
      if (!validToken) {
        throw new InvalidCredentialsError('Invalid login token!');
      }

      const session = await lucia.createSession(loginToken.userId, {});
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
