import { apiReference } from '@scalar/express-api-reference'
import express from 'express'
import type { Container } from './container.js'
import { authMiddleware } from './middlewares/auth.middleware.js'
import { errorMiddleware } from './middlewares/error.middleware.js'
import { AnalyticsHttpController } from './modules/analytics/http/analytics.http.controller.js'
import { analyticsHttpRouter } from './modules/analytics/http/analytics.http.routes.js'
import { AuthHttpController } from './modules/auth/http/auth.http.controller.js'
import { authHttpRouter } from './modules/auth/http/auth.http.routes.js'
import { CategoryHttpController } from './modules/categories/http/category.http.controller.js'
import { categoryHttpRouter } from './modules/categories/http/category.http.routes.js'
import { TelegramController } from './modules/telegram/telegram.controller.js'
import { telegramRouter } from './modules/telegram/telegram.routes.js'
import { TransactionHttpController } from './modules/transactions/http/transaction.http.controller.js'
import { transactionHttpRouter } from './modules/transactions/http/transaction.http.routes.js'
import { UserHttpController } from './modules/users/http/user.http.controller.js'
import { userHttpRouter } from './modules/users/http/user.http.routes.js'
import { openApiDocument } from './openapi/openapi.js'

export function createApp(container: Container) {
  const app = express()

  // Controllers
  const authController = new AuthHttpController(container.authService)
  const userController = new UserHttpController(container.userService)
  const categoryHttpController = new CategoryHttpController(container.categoryService)
  const transactionController = new TransactionHttpController(container.transactionService)
  const analyticsController = new AnalyticsHttpController(container.analyticsService)
  const telegramController = new TelegramController(container.telegramService)

  app.disable('x-powered-by')
  app.use(express.json())

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

  app.use('/auth', authHttpRouter(authController))
  app.use('/telegram', telegramRouter(telegramController))
  app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }))

  app.use('/users', authMiddleware, userHttpRouter(userController))
  app.use('/categories', authMiddleware, categoryHttpRouter(categoryHttpController))
  app.use('/transactions', authMiddleware, transactionHttpRouter(transactionController))
  app.use('/analytics', authMiddleware, analyticsHttpRouter(analyticsController))

  app.use(errorMiddleware)

  return app
}
