import { t } from 'elysia';
import {
  accountSelectSchema,
  loginTokens,
  loginTokensSelectSchema,
} from '~/database/schema';

export const initiateLoginBodySchema = t.Composite([
  t.Omit(accountSelectSchema, [
    'id',
    'verified',
    'registrationDate',
    'lastUpdateDate',
    'lastLoginDate',
    'firstName',
    'lastName',
    'phoneNumber',
  ]),
  t.Object({
    password: t.String(),
  }),
]);

export const initiateLoginSchema = t.Omit(loginTokensSelectSchema, [
  'userId',
  'created',
  'expiresAt',
]);

export const loginBodySchema = t.Composite([initiateLoginSchema]);
