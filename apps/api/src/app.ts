import { fileURLToPath } from 'node:url'
import express from 'express'
import { isProduction } from './config/app.config.js'
import type { Container } from './container.js'
import { createApiRouter } from './http/api.router.js'
import { errorMiddleware } from './middlewares/error.middleware.js'
import { debugHttpPayloadLogger, httpLogger } from './middlewares/logger.middleware.js'
import { verbose } from './shared/logger/logger.js'

const webDistPath = fileURLToPath(new URL('../../web/dist', import.meta.url))
const backendPathPrefixes = ['/api', '/webhooks']

export function createApp(container: Container) {
  const app = express()

  if (isProduction) {
    app.set('trust proxy', 1)
  }

  app.disable('x-powered-by')

  app.use(httpLogger)
  app.use(express.json())
  if (verbose) {
    app.use(debugHttpPayloadLogger)
  }

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' })
  })

  app.use('/api', createApiRouter(container))

  if (isProduction) {
    app.use(express.static(webDistPath, { index: false }))

    app.get('/{*splat}', (req, res, next) => {
      const isBackendPath = backendPathPrefixes.some(
        (prefix) => req.path === prefix || req.path.startsWith(`${prefix}/`),
      )

      if (isBackendPath || !req.accepts('html')) {
        next()
        return
      }

      res.setHeader('Cache-Control', 'no-cache')
      res.sendFile('index.html', { root: webDistPath })
    })
  }

  app.use(errorMiddleware)

  return app
}
