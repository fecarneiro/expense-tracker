import { apiReference } from '@scalar/express-api-reference'
import express from 'express'
import type { Container } from './container.js'
import { authMiddleware } from './middlewares/auth.middleware.js'
import { errorMiddleware } from './middlewares/error.middleware.js'
import { AnalyticsController } from './modules/analytics/analytics.controller.js'
import { analyticRouter } from './modules/analytics/analytics.routes.js'
import { AuthController } from './modules/auth/auth.controller.js'
import { authRouter } from './modules/auth/auth.routes.js'
import { CategoryHttpController } from './modules/categories/http/category.http.controller.js'
import { categoryHttpRouter } from './modules/categories/http/category.http.routes.js'
import { TelegramController } from './modules/telegram/telegram.controller.js'
import { telegramRouter } from './modules/telegram/telegram.routes.js'
import { TransactionController } from './modules/transactions/transaction.controller.js'
import { transactionRouter } from './modules/transactions/transaction.routes.js'
import { UserController } from './modules/users/http/user.http.controller.js'
import { userRouter } from './modules/users/http/user.http.routes.js'
import { openApiDocument } from './openapi/openapi.document.js'

export function createApp(container: Container) {
  const app = express()

  // Controllers
  const authController = new AuthController(container.authService)
  const userController = new UserController(container.userService)
  const categoryHttpController = new CategoryHttpController(container.categoryService)
  const transactionController = new TransactionController(container.transactionService)
  const analyticController = new AnalyticsController(container.analyticsService)
  const telegramController = new TelegramController(container.telegramService)

  app.disable('x-powered-by')
  app.use(express.json())

  app.get('/openapi.json', (_req, res) => {
    res.status(200).json(openApiDocument)
  })

  app.use('/docs', apiReference({ url: '/openapi.json', theme: 'purple' }))

  app.use('/auth', authRouter(authController))
  app.use('/telegram', telegramRouter(telegramController))
  app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }))

  app.use('/users', authMiddleware, userRouter(userController))
  app.use('/categories', authMiddleware, categoryHttpRouter(categoryHttpController))
  app.use('/transactions', authMiddleware, transactionRouter(transactionController))
  app.use('/analytics', authMiddleware, analyticRouter(analyticController))

  app.use(errorMiddleware)

  return app
}
