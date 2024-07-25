import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { createId } from '@paralleldrive/cuid2';
import swagger from '@elysiajs/swagger';
import { ThemeId } from '@elysiajs/swagger/scalar/types';

import env from './env';
import index from './routes/index';

const app = new Elysia()
  .use(
    swagger({
      path: 'docs',
      scalarConfig: {
        theme: 'kepler' as ThemeId,
      },
    })
  )
  .use(cors())
  .guard(
    {
      cookie: t.Cookie({
        deviceId: t.Optional(t.String()),
      }),
      // Ensure deviceId is set for the following routes
      beforeHandle({ set: _, cookie: { deviceId } }) {
        if (!deviceId.value) {
          deviceId.set({
            value: createId(),
            path: '/',
          });
        }
        deviceId.expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      },
    },
    (app) => app.use(index)
  )
  .listen(env.API_PORT);

export type App = typeof app;

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
