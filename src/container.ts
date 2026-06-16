import type { Database } from './database/db.js'
import { AnalyticsQuery } from './modules/analytics/analytics.query.js'
import { AnalyticsService } from './modules/analytics/analytics.service.js'
import { AuthService } from './modules/auth/auth.service.js'
import { CategoryRepository } from './modules/categories/category.repository.js'
import { CategoryService } from './modules/categories/category.service.js'
import { TelegramRepository } from './modules/telegram/telegram.repository.js'
import { TelegramService } from './modules/telegram/telegram.service.js'
import { TransactionRepository } from './modules/transactions/transaction.repository.js'
import { TransactionService } from './modules/transactions/transaction.service.js'
import { UserRepository } from './modules/users/user.repository.js'
import { UserService } from './modules/users/user.service.js'
import { PasswordHasher } from './shared/password-hasher.js'

export function createContainer(db: Database) {
  // shared
  const passwordHasher = new PasswordHasher()

  // repositories
  const userRepository = new UserRepository(db)
  const categoryRepository = new CategoryRepository(db)
  const transactionRepository = new TransactionRepository(db)
  const analyticsQuery = new AnalyticsQuery(db)
  const telegramRepository = new TelegramRepository(db)

  // services
  const userService = new UserService(userRepository, passwordHasher)
  const authService = new AuthService(userService)
  const categoryService = new CategoryService(categoryRepository)
  const transactionService = new TransactionService(transactionRepository)
  const analyticsService = new AnalyticsService(analyticsQuery)
  const telegramService = new TelegramService(authService, telegramRepository)

  return {
    authService,
    userService,
    categoryService,
    transactionService,
    analyticsService,
    telegramService,
  }
}

export type Container = ReturnType<typeof createContainer>
