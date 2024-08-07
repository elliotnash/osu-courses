import { Elysia, error } from 'elysia';
import { db } from '~/database/db';
import {
  accounts,
  loginTokens,
  passwordAuth,
  supportedMfas,
  supportedMfasInsertSchema,
  supportedMfasSelectSchema,
} from '~/database/schema';
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
        return error(InvalidCredentialsError.status, {
          ...InvalidCredentialsError,
          message: 'Invalid email or password!',
        });
      }

      const password = await db.query.passwordAuth.findFirst({
        where: eq(passwordAuth.userId, user.id),
      });
      if (!password) {
        return error(
          PasswordResetRequiredError.status,
          PasswordResetRequiredError
        );
      }

      const validPassword = await Bun.password.verify(
        body.password,
        password.hash,
        hashAlgo.algorithm
      );
      if (!validPassword) {
        return error(InvalidCredentialsError.status, InvalidCredentialsError);
      }

      const mfas = (await db.query.supportedMfas.findFirst({
        columns: {
          emailMfa: true,
          totpMfa: true,
        },
        where: eq(supportedMfas.userId, user.id),
      })) ?? {
        emailMfa: false,
        totpMfa: false,
      };

      const id = createId();
      const token = createToken();
      await db.insert(loginTokens).values({
        id,
        userId: user.id,
        token: await Bun.password.hash(token, hashAlgo),
        expiresAt: addMinutes(15, new Date()),
      });
      return {
        id,
        token,
        supportedMfas: Object.entries(mfas)
          .filter(([_, val]) => val)
          .map(([k]) => k as keyof typeof mfas),
      };
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
        return error(InvalidCredentialsError.status, {
          ...InvalidCredentialsError,
          message: 'Invalid login token!',
        });
      }

      const validToken = await Bun.password.verify(
        body.token,
        loginToken.token
      );
      if (!validToken) {
        return error(InvalidCredentialsError.status, {
          ...InvalidCredentialsError,
          message: 'Invalid login token!',
        });
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
