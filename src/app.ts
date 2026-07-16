import { apiReference } from '@scalar/express-api-reference'
import express from 'express'
import { isProduction } from './config/app.config.js'
import { authRateLimiter, globalRateLimiter } from './config/rate-limit.config.js'
import type { Container } from './container.js'
import { authMiddleware } from './middlewares/auth.middleware.js'
import { errorMiddleware } from './middlewares/error.middleware.js'
import { partnershipMiddleware } from './middlewares/partnership.middleware.js'
import { AuthHttpController } from './modules/auth/http/auth.http.controller.js'
import { authHttpRouter } from './modules/auth/http/auth.http.routes.js'
import { BotHttpController } from './modules/bot/http/bot.http.controller.js'
import { botHttpRouter } from './modules/bot/http/bot.http.routes.js'
import { CategoryHttpController } from './modules/categories/http/category.http.controller.js'
import { categoryHttpRouter } from './modules/categories/http/category.http.routes.js'
import { PartnershipHttpController } from './modules/partners/partnerships/http/partnership.http.controller.js'
import { partnershipHttpRouter } from './modules/partners/partnerships/http/partnership.http.routes.js'
import { SettlementHttpController } from './modules/partners/settlements/http/settlement.http.controller.js'
import { settlementHttpRouter } from './modules/partners/settlements/http/settlement.http.routes.js'
import { SharedCategoryHttpController } from './modules/partners/shared-categories/http/shared-category.http.controller.js'
import { sharedCategoryHttpRouter } from './modules/partners/shared-categories/http/shared-category.http.routes.js'
import { SharedExpenseHttpController } from './modules/partners/shared-expenses/http/shared-expense.http.controller.js'
import { sharedExpenseHttpRouter } from './modules/partners/shared-expenses/http/shared-expense.http.routes.js'
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
  const botController = new BotHttpController(container.botService)
  const partnershipController = new PartnershipHttpController(container.partnershipService)
  const sharedCategoryController = new SharedCategoryHttpController(container.sharedCategoryService)
  const sharedExpenseController = new SharedExpenseHttpController(container.sharedExpenseService)
  const settlementController = new SettlementHttpController(container.settlementService)

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

  app.use('/bot', globalRateLimiter, authMiddleware, botHttpRouter(botController))

  app.use(
    '/partnerships',
    globalRateLimiter,
    authMiddleware,
    partnershipHttpRouter(partnershipController),
  )

  app.use(
    '/shared-categories',
    globalRateLimiter,
    authMiddleware,
    partnershipMiddleware(container.partnershipService),
    sharedCategoryHttpRouter(sharedCategoryController),
  )

  app.use(
    '/shared-expenses',
    globalRateLimiter,
    authMiddleware,
    partnershipMiddleware(container.partnershipService),
    sharedExpenseHttpRouter(sharedExpenseController),
  )

  app.use(
    '/settlements',
    globalRateLimiter,
    authMiddleware,
    partnershipMiddleware(container.partnershipService),
    settlementHttpRouter(settlementController),
  )

  app.use(errorMiddleware)

  return app
}
