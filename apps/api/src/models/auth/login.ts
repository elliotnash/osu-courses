import { t } from 'elysia';
import {
  accountSelectSchema,
  loginTokensSelectSchema,
  supportedMfas,
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

export const supportedMfasSchema = t.KeyOf(
  t.Omit(supportedMfasSelectSchema, ['userId'])
);
export type SupportedMfas = typeof supportedMfasSchema.static;

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
    supportedMfas: t.Array(supportedMfasSchema, { uniqueItems: true }),
  }),
]);
export type InitiateLogin = typeof initiateLoginSchema.static;

export const loginBodySchema = t.Composite([
  t.Omit(initiateLoginSchema, ['supportedMfas']),
  t.Object({
    mfa: t.Optional(
      t.Object({
        method: supportedMfasSchema,
        code: t.String(),
      })
    ),
  }),
]);
