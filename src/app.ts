import cookieParser from 'cookie-parser'
import express from 'express'
import type { Container } from './container.js'
import { authMiddleware } from './middlewares/auth.middleware.js'
import { errorMiddleware } from './middlewares/error.middleware.js'
import { AnalyticsController } from './modules/analytics/analytics.controller.js'
import { analyticRouter } from './modules/analytics/analytics.routes.js'
import { AuthController } from './modules/auth/auth.controller.js'
import { authRouter } from './modules/auth/auth.routes.js'
import { CategoryController } from './modules/categories/category.controller.js'
import { categoryRouter } from './modules/categories/category.routes.js'
import { TelegramController } from './modules/telegram/telegram.controller.js'
import { telegramRouter } from './modules/telegram/telegram.routes.js'
import { TransactionController } from './modules/transactions/transaction.controller.js'
import { transactionRouter } from './modules/transactions/transaction.routes.js'
import { UserController } from './modules/users/user.controller.js'
import { userRouter } from './modules/users/user.routes.js'

export function createApp(container: Container) {
  const app = express()

  // Controllers — borda HTTP, montados a partir dos services do container
  const authController = new AuthController(container.authService)
  const userController = new UserController(container.userService)
  const categoryController = new CategoryController(container.categoryService)
  const transactionController = new TransactionController(container.transactionService)
  const analyticController = new AnalyticsController(container.analyticsService)
  const telegramController = new TelegramController(container.telegramService)

  app.disable('x-powered-by')
  app.use(cookieParser())
  app.use(express.json())

  app.use('/auth', authRouter(authController))
  app.use('/telegram', telegramRouter(telegramController))

  app.use(authMiddleware)
  app.use('/users', userRouter(userController))
  app.use('/categories', categoryRouter(categoryController))
  app.use('/transactions', transactionRouter(transactionController))
  app.use('/analytics', analyticRouter(analyticController))

  app.use('/', (_req, res) => {
    res.status(404).json({ message: 'Not found' })
  })

  app.use(errorMiddleware)

  return app
}
