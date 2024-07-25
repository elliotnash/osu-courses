import { t } from 'elysia'
import { accountInsertSchema } from '~/database/schema'

export const registerBodySchema = t.Composite([
  t.Omit(accountInsertSchema, [
    'cuid',
    'registrationDate',
    'lastUpdateDate',
    'lastLoginDate',
  ]),
  t.Object({
    password: t.String(),
  }),
])
