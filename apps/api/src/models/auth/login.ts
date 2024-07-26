import { t } from 'elysia';
import { accountSelectSchema } from '~/database/schema';

export const loginBodySchema = t.Composite([
  t.Omit(accountSelectSchema, [
    'id',
    'emailVerified',
    'registrationDate',
    'lastUpdateDate',
    'lastLoginDate',
    'username',
    'firstName',
    'lastName',
    'phoneNumber',
  ]),
  t.Object({
    password: t.String(),
  }),
]);
