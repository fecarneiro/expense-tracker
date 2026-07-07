import { apiReference } from '@scalar/express-api-reference'
import express from 'express'
import { isProduction } from './config/app.config.js'
import { authRateLimiter, globalRateLimiter } from './config/rate-limit.config.js'
import type { Container } from './container.js'
import { authMiddleware } from './middlewares/auth.middleware.js'
import { errorMiddleware } from './middlewares/error.middleware.js'
import { AuthHttpController } from './modules/auth/http/auth.http.controller.js'
import { authHttpRouter } from './modules/auth/http/auth.http.routes.js'
import { CategoryHttpController } from './modules/categories/http/category.http.controller.js'
import { categoryHttpRouter } from './modules/categories/http/category.http.routes.js'
import { TelegramHttpController } from './modules/telegram/http/telegram.http.controller.js'
import { telegramHttpRouter } from './modules/telegram/http/telegram.http.routes.js'
import { TransactionHttpController } from './modules/transactions/http/transaction.http.controller.js'
import { transactionHttpRouter } from './modules/transactions/http/transaction.http.routes.js'
import { UserHttpController } from './modules/users/http/user.http.controller.js'
import { userHttpRouter } from './modules/users/http/user.http.routes.js'
import { openApiDocument } from './openapi/openapi.js'
import { httpLogger } from './shared/logger/http-logger.js'

export function createApp(container: Container) {
  const app = express()

  // Controllers
  const authController = new AuthHttpController(container.authService)
  const userController = new UserHttpController(container.userService)
  const categoryHttpController = new CategoryHttpController(container.categoryService)
  const transactionController = new TransactionHttpController(container.transactionService)
  const telegramController = new TelegramHttpController(container.telegramService)

  if (isProduction) {
    app.set('trust proxy', 1)
  }

  app.disable('x-powered-by')

  app.use(httpLogger)
  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' })
  })

  app.get('/openapi.json', (_req, res) => {
    res.status(200).json(openApiDocument)
  })

  app.use(
    '/docs',
    apiReference({
      content: openApiDocument,
      theme: 'deepSpace',
    }),
  )

  app.use('/auth', authRateLimiter, authHttpRouter(authController))
  app.use('/users', globalRateLimiter, authMiddleware, userHttpRouter(userController))

  app.use(
    '/categories',
    globalRateLimiter,
    authMiddleware,
    categoryHttpRouter(categoryHttpController),
  )
  app.use(
    '/transactions',
    globalRateLimiter,
    authMiddleware,
    transactionHttpRouter(transactionController),
  )

  app.use('/telegram', globalRateLimiter, authMiddleware, telegramHttpRouter(telegramController))

  app.use(errorMiddleware)

  return app
}
