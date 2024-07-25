import { Elysia } from 'elysia'
import { registerBodySchema } from '~/models/auth/register'

export default new Elysia().post(
  '/create',
  ({ body }) => {
    console.log(body.email)
  },
  {
    body: registerBodySchema,
  }
)
