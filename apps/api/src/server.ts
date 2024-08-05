import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import swagger from '@elysiajs/swagger';
import { ThemeId } from '@elysiajs/swagger/scalar/types';

import env from './env';
import routes from './routes/plugin';

const app = new Elysia()
  .onError((event) => {
    console.log(event.error);
    return JSON.stringify(event.error);
  })
  .use(
    swagger({
      path: 'docs',
      scalarConfig: {
        theme: 'kepler' as ThemeId,
      },
    })
  )
  .use(cors())
  .use(routes)
  .listen(env.API_PORT);

export type App = typeof app;

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
