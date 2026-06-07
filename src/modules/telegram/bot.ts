import { Bot } from 'grammy'
import { env } from '../../config/env.config.js'
import { db } from '../../database/db.js'
import { PasswordHasher } from '../../shared/password-hasher.js'
import { AuthService } from '../auth/auth.service.js'
import { CategoryRepository } from '../categories/category.repository.js'
import { CategoryService } from '../categories/category.service.js'
import { TransactionRepository } from '../transactions/transaction.repository.js'
import { TransactionService } from '../transactions/transaction.service.js'
import { UserRepository } from '../users/user.repository.js'
import { transactionHandler } from './handlers/transaction.handler.js'
import { userIdentityMiddleware } from './middlewares/user-identity.middleware.js'
import { registerBotCommands } from './parsers/commands.js'
import type { BotContext } from './telegram.context.js'
import { errorHandler } from './telegram.error-handler.js'
import { TelegramRepository } from './telegram.repository.js'
import { TelegramService } from './telegram.service.js'

export async function createTelegramBot() {
  const userRepository = new UserRepository(db)
  const passwordHasher = new PasswordHasher()
  const telegramRepository = new TelegramRepository(db)
  const authService = new AuthService(userRepository, passwordHasher)
  const telegramService = new TelegramService(authService, telegramRepository)
  const categoryRepository = new CategoryRepository(db)
  const categoryService = new CategoryService(categoryRepository)
  const transactionRepository = new TransactionRepository(db)
  const transactionService = new TransactionService(transactionRepository)

  const bot = new Bot<BotContext>(env.TELEGRAM_BOT_TOKEN)

  bot.catch(errorHandler)

  //--- Public Commands
  bot.command('start', (ctx) => ctx.reply('Welcome! Up and running.'))
  bot.command('me', (ctx) => {
    if (!ctx.from) return ctx.reply('Error getting Telegram ID')
    return ctx.reply(ctx.from.id.toString())
  })
  bot.command('hi', (ctx) => console.log(JSON.stringify(ctx, null, 2)))

  //--- Gate: everything below requires a linked account
  bot.use(userIdentityMiddleware(telegramService))

  // --- Handlers
  bot.use(transactionHandler(transactionService, categoryService))

  // --- Commands
  await registerBotCommands(bot)

  bot.start()
}
