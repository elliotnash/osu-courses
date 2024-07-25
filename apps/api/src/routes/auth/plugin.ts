import { Elysia } from 'elysia'
import register from '~/routes/auth/register'

export default new Elysia({ prefix: '/auth' }).use(register)
