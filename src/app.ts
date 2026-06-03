import cookieParser from 'cookie-parser'
import express from 'express'
import { db } from './database/db.js'
import { authMiddleware } from './middlewares/auth.middleware.js'
import { errorMiddleware } from './middlewares/error.middleware.js'
import { AnalyticsController } from './modules/analytics/analytics.controller.js'
import { AnalyticsQuery } from './modules/analytics/analytics.query.js'
import { analyticRouter } from './modules/analytics/analytics.routes.js'
import { AnalyticsService } from './modules/analytics/analytics.service.js'
import { AuthController } from './modules/auth/auth.controller.js'
import { authRouter } from './modules/auth/auth.routes.js'
import { AuthService } from './modules/auth/auth.service.js'
import { CategoryController } from './modules/categories/category.controller.js'
import { CategoryRepository } from './modules/categories/category.repository.js'
import { categoryRouter } from './modules/categories/category.routes.js'
import { CategoryService } from './modules/categories/category.service.js'
import { TransactionController } from './modules/transactions/transaction.controller.js'
import { TransactionRepository } from './modules/transactions/transaction.repository.js'
import { transactionRouter } from './modules/transactions/transaction.routes.js'
import { TransactionService } from './modules/transactions/transaction.service.js'
import { UserController } from './modules/users/user.controller.js'
import { UserRepository } from './modules/users/user.repository.js'
import { userRouter } from './modules/users/user.routes.js'
import { UserService } from './modules/users/user.service.js'
import { PasswordHasher } from './shared/password-hasher.js'

export function createApp() {
  const app = express()

  // Shared
  const passwordHasher = new PasswordHasher()
  // Repositories
  const userRepository = new UserRepository(db)
  const categoryRepository = new CategoryRepository(db)
  const transactionRepository = new TransactionRepository(db)
  const analyticsQuery = new AnalyticsQuery(db)
  // Services
  const authService = new AuthService(userRepository, passwordHasher)
  const userService = new UserService(userRepository, passwordHasher)
  const categoryService = new CategoryService(categoryRepository)
  const transactionService = new TransactionService(transactionRepository)
  const analyticService = new AnalyticsService(analyticsQuery)
  // Controllers
  const authController = new AuthController(authService)
  const userController = new UserController(userService)
  const categoryController = new CategoryController(categoryService)
  const transactionController = new TransactionController(transactionService)
  const analyticController = new AnalyticsController(analyticService)

  app.disable('x-powered-by')
  app.use(cookieParser())
  app.use(express.json())

  app.use('/auth', authRouter(authController))

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
