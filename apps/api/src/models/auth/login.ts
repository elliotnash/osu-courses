import { t } from 'elysia'
import { registerBodySchema } from '~/models/auth/register'

export const loginBodySchema = t.Omit(registerBodySchema, [
  'firstName',
  'lastName',
  'phoneNumber',
])
