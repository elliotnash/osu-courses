import { Elysia, t } from 'elysia'
import { cors } from '@elysiajs/cors'
import { createId } from '@paralleldrive/cuid2'
import swagger from '@elysiajs/swagger'
import { ThemeId } from '@elysiajs/swagger/scalar/types'

import env from './env'
import index from './routes/index'

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
  .use(index)
  .listen(env.API_PORT)

export type App = typeof app

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
)
