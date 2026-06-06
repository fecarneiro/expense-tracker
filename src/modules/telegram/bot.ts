import { Bot, type Context } from 'grammy'
import { env } from '../../config/env.config.js'
import { db } from '../../database/db.js'
import { PasswordHasher } from '../../shared/password-hasher.js'
import { AuthService } from '../auth/auth.service.js'
import { CategoryRepository } from '../categories/category.repository.js'
import { CategoryService } from '../categories/category.service.js'
import { TransactionRepository } from '../transactions/transaction.repository.js'
import { TransactionService } from '../transactions/transaction.service.js'
import { UserRepository } from '../users/user.repository.js'
import { userIdentityMiddleware } from './middlewares/user-identity.middleware.js'
import { createNewTransactionFromTelegramSchema } from './telegram.dto.js'
import { errorHandler } from './telegram.error-handler.js'
import { parseNewTransactionMessage } from './telegram.parser.js'
import { TelegramRepository } from './telegram.repository.js'
import { TelegramService } from './telegram.service.js'

const botToken = env.TELEGRAM_BOT_TOKEN

export type BotContext = Context & {
  userId: string
}

export function createTelegramBot() {
  const userRepository = new UserRepository(db)
  const passwordHasher = new PasswordHasher()
  const telegramRepository = new TelegramRepository(db)
  const authService = new AuthService(userRepository, passwordHasher)
  const telegramService = new TelegramService(authService, telegramRepository)
  const categoryRepository = new CategoryRepository(db)
  const categoryService = new CategoryService(categoryRepository)
  const transactionRepository = new TransactionRepository(db)
  const transactionService = new TransactionService(transactionRepository)

  const bot = new Bot<BotContext>(botToken)

  //--- Error boundary
  bot.catch(errorHandler)

  //--- Public Commands
  bot.command('start', (ctx) => ctx.reply('Welcome! Up and running.'))
  bot.command('me', (ctx) => {
    if (!ctx.from) return ctx.reply('Error getting Telegram ID')
    return ctx.reply(ctx.from.id.toString())
  })

  //--- Gate: everything below requires a linked account
  bot.use(userIdentityMiddleware(telegramService))

  bot.on('message:text', async (ctx) => {
    const { userId } = ctx // guaranteed by gate

    const parsed = parseNewTransactionMessage(ctx.message.text)

    console.log(parsed)

    const { amountInCents, categoryName } =
      createNewTransactionFromTelegramSchema.parse(parsed)

    const category = await categoryService.findByName({
      name: categoryName,
      userId,
    })
    if (!category) return ctx.reply(`Category '${categoryName}' not found`)

    const occurredOn = new Date(ctx.message.date * 1000)
      .toISOString()
      .slice(0, 10)

    await transactionService.create({
      userId,
      amountInCents,
      categoryId: category.id,
      occurredOn,
      transactionType: 'expense',
      notes: null,
    })

    return ctx.reply(`Transaction '${200}' for '${categoryName}' created`)
  })

  bot.start()
}
