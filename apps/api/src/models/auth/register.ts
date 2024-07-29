import { t } from 'elysia';
import { accountInsertSchema } from '~/database/schema';
import { osuEmailRegex, strongPasswordRegex } from '~/consts';

export const registerBodySchema = t.Composite([
  t.Omit(accountInsertSchema, [
    'id',
    'email',
    'verified',
    'registrationDate',
    'lastUpdateDate',
    'lastLoginDate',
  ]),
  t.Object({
    email: t.RegExp(osuEmailRegex),
    password: t.RegExp(strongPasswordRegex),
  }),
]);

export const verifySubmitBodySchema = t.Object({
  code: t.String({ minLength: 6, maxLength: 6 }),
});
