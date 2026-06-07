import { Composer } from 'grammy'
import type { CategoryService } from '../../categories/category.service.js'
import type { TransactionType } from '../../transactions/transaction.dto.js'
import type { TransactionService } from '../../transactions/transaction.service.js'
import { newTransactionParser } from '../parsers/new-transaction.parser.js'
import type { BotContext } from '../telegram.context.js'
import { createNewTransactionFromTelegramSchema } from '../telegram.dto.js'

export function transactionHandler(
  transactionService: TransactionService,
  categoryService: CategoryService,
) {
  const composer = new Composer<BotContext>()
  composer.command('expense', (ctx) => handleNew(ctx, 'expense', ctx.match))
  composer.command('income', (ctx) => handleNew(ctx, 'income', ctx.match))
  composer.on('message:text', (ctx) => handleNew(ctx, 'expense', ctx.message.text))

  async function handleNew(ctx: BotContext, transactionType: TransactionType, text: string) {
    const { userId } = ctx // guaranteed by user-identity middleware
    if (!text) return ctx.reply('Usage: /expense 200 eating out')

    const parsed = newTransactionParser(text)

    const { amountInCents, categoryName } = createNewTransactionFromTelegramSchema.parse(parsed)

    const category = await categoryService.findByName({
      name: categoryName,
      userId,
    })

    if (!category) return ctx.reply(`Category '${categoryName}' not found`)

    const occurredOn = new Date().toISOString().slice(0, 10)

    await transactionService.create({
      userId,
      amountInCents,
      categoryId: category.id,
      occurredOn,
      transactionType: transactionType,
      notes: null,
    })

    return ctx.reply(`Transaction amount: ${amountInCents / 100},00 for '${categoryName}' registed`)
  }

  return composer
}
