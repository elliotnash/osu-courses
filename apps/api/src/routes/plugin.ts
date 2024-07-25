import { Elysia, t } from 'elysia'
import account from '~/routes/auth/account'

export default new Elysia()
  .get('/ping', () => 'Pong!' as const, {
    response: t.Literal('Pong!'),
  })
  .use(account)
