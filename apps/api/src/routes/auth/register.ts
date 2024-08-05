import { Elysia, t, error } from 'elysia';
import {
  registerBodySchema,
  verifySubmitBodySchema,
} from '~/models/auth/register';
import { createId } from '@paralleldrive/cuid2';
import { db } from '~/database/db';
import { accounts, emailAuth, passwordAuth, sessions } from '~/database/schema';
import { lucia } from '~/auth';
import { eq, and, gt, max } from 'drizzle-orm';
import { createVerificationCode } from '~/util';
import {
  addHours,
  addMinutes,
  addSeconds,
  subMinutes,
  subSeconds,
} from 'date-fns/fp';
import auth from '~/middleware/auth';
import '~/auth';
import { mailer } from '~/mailer';
import {
  EmailVerificationConflictError,
  UnauthorizedError,
  RegistrationEmailConflictError,
  InvalidCredentialsError,
  VerificationRequestTimeoutError,
  VerificationRequestExistsError,
} from '~/errors';
import {
  verificationCodeExpirationMinutes,
  verificationCodeRenewMinutes,
  verificationRequestTimeoutSeconds,
} from '~/consts';

export default new Elysia()
  .post(
    '/register',
    async ({ cookie, body }) => {
      const user = await db.query.accounts.findFirst({
        where: eq(accounts.email, body.email),
      });
      if (user) {
        return error(
          RegistrationEmailConflictError.status,
          RegistrationEmailConflictError
        );
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
  .get(
    '/verify-request',
    async ({ user, query: { resend } }) => {
      console.log(`requesting with resend: ${resend}`);
      if (!user) {
        return error(UnauthorizedError.status, UnauthorizedError);
      }
      if (user.verified) {
        return error(
          EmailVerificationConflictError.status,
          EmailVerificationConflictError
        );
      }

      // Limit requests to once a minute
      const [{ createdAt: lastDate }] = await db
        .select({ createdAt: max(emailAuth.createdAt) })
        .from(emailAuth)
        .where(
          and(
            eq(emailAuth.userId, user.id),
            gt(
              emailAuth.createdAt,
              subSeconds(verificationRequestTimeoutSeconds, new Date())
            )
          )
        );
      if (lastDate) {
        return error(VerificationRequestTimeoutError.status, {
          ...VerificationRequestTimeoutError,
          nextRequest: addSeconds(verificationRequestTimeoutSeconds, lastDate),
        });
      }

      // If an email already exists, only resend if within 5 min of expiration.
      // If resend is passed, always resend
      if (!resend) {
        const [{ expiresAt: lastDate }] = await db
          .select({
            expiresAt: max(emailAuth.expiresAt),
          })
          .from(emailAuth)
          .where(
            and(
              eq(emailAuth.userId, user.id),
              gt(
                emailAuth.expiresAt,
                addMinutes(verificationCodeRenewMinutes, new Date())
              )
            )
          );
        if (lastDate) {
          return error(
            VerificationRequestExistsError.status,
            VerificationRequestExistsError
          );
        }
      }

      const code = createVerificationCode();
      await db.insert(emailAuth).values({
        userId: user.id,
        code,
        expiresAt: addMinutes(verificationCodeExpirationMinutes, new Date()),
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

      return {
        nextRequest: addSeconds(verificationRequestTimeoutSeconds, new Date()),
      };
    },
    {
      query: t.Object({
        resend: t.BooleanString({ default: false }),
      }),
    }
  )
  .post(
    '/verify-submit',
    async ({ user, body: { code }, cookie }) => {
      if (!user) {
        return error(UnauthorizedError.status, UnauthorizedError);
      }
      if (user.verified) {
        return error(
          EmailVerificationConflictError.status,
          EmailVerificationConflictError
        );
      }
      const verifyToken = await db.query.emailAuth.findFirst({
        where: and(
          eq(emailAuth.userId, user.id),
          eq(emailAuth.code, code),
          gt(emailAuth.expiresAt, new Date())
        ),
      });
      if (!verifyToken) {
        return error(InvalidCredentialsError.status, {
          ...InvalidCredentialsError,
          message: 'Invalid verification code.',
        });
      }
      await db
        .update(accounts)
        .set({ verified: true })
        .where(eq(accounts.id, user.id));
      await db.delete(emailAuth).where(eq(emailAuth.id, verifyToken.id));
    },
    {
      body: verifySubmitBodySchema,
    }
  );
