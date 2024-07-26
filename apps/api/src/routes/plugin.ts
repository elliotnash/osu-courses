import { Elysia, t } from 'elysia';
import auth from '~/routes/auth/plugin';

export default new Elysia()
  .get('/ping', () => 'Pong!' as const, {
    response: t.Literal('Pong!'),
  })
  .use(auth);
