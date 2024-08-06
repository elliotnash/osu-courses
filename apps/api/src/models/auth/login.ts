import { t } from 'elysia';
import {
  accountSelectSchema,
  loginTokensSelectSchema,
  supportedMfasInsertSchema,
  supportedMfasSelectSchema,
} from '~/database/schema';

const omitted = [
  'id',
  'verified',
  'registrationDate',
  'lastUpdateDate',
  'lastLoginDate',
  'firstName',
  'lastName',
  'phoneNumber',
] as const;

export const initiateLoginBodySchema = t.Composite([
  t.Omit(accountSelectSchema, [
    ...omitted,
    // Supported MFAs
    'emailMfa',
    'totpMfa',
  ]),
  t.Object({
    password: t.String(),
  }),
]);

export const initiateLoginSchema = t.Composite([
  t.Omit(loginTokensSelectSchema, ['userId', 'createdAt', 'expiresAt']),
  t.Object({
    supportedMfas: t.Omit(supportedMfasSelectSchema, ['userId']),
  }),
]);

export const loginBodySchema = t.Composite([initiateLoginSchema]);
