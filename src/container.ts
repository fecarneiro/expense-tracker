import type { Database } from './database/db.js'
import { AuthService } from './modules/auth/auth.service.js'
import { BotRepository } from './modules/bot/bot.repository.js'
import { BotService } from './modules/bot/bot.service.js'
import { CategoryRepository } from './modules/categories/category.repository.js'
import { CategoryService } from './modules/categories/category.service.js'
import { LinkingCodeRepository } from './modules/linking-codes/linking-code.repository.js'
import { LinkingCodeService } from './modules/linking-codes/linking-code.service.js'
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
  const botRepository = new BotRepository(db)
  const linkingCodeRepository = new LinkingCodeRepository(db)

  // services
  const userService = new UserService(userRepository, passwordHasher)
  const categoryService = new CategoryService(categoryRepository)
  const authService = new AuthService(userService, categoryService, db)
  const transactionService = new TransactionService(
    transactionRepository,
    categoryRepository,
    userRepository,
    userService,
  )
  const linkingCodeService = new LinkingCodeService(linkingCodeRepository)
  const botService = new BotService(botRepository, linkingCodeService)

  return {
    authService,
    userService,
    categoryService,
    transactionService,
    botService,
  }
}

export type Container = ReturnType<typeof createContainer>
