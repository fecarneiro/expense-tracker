import express from 'express'
import { isProduction } from './config/app.config.js'
import type { Container } from './container.js'
import { createApiRouter } from './http/api.router.js'
import { errorMiddleware } from './middlewares/error.middleware.js'
import { httpLogger } from './shared/logger/http-logger.js'

export function createApp(container: Container) {
  const app = express()

  if (isProduction) {
    app.set('trust proxy', 1)
  }

  app.disable('x-powered-by')

  app.use(httpLogger)
  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' })
  })

  app.use('/api', createApiRouter(container))

  app.use(errorMiddleware)

  return app
}
