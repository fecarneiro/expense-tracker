import { InlineKeyboard } from 'grammy'
import { centsToString } from '../../../../utils/money.utils.js'
import type { BotConversation, BotConversationContext } from '../../../bot/bot.context.js'
import { CANCEL_HINT } from '../../../bot/handlers/cancel.handler.js'
import type { SharedCategoryService } from '../../shared-categories/shared-category.service.js'
import type { SharedExpenseService } from '../shared-expense.service.js'
import { SPLIT_TYPE, type SplitType } from '../shared-expense.types.js'
import { resolveSplitAmounts } from '../shared-expense.utils.js'
import {
  type SharedExpenseAmountCents,
  sharedExpenseAmountParser,
} from './parsers/shared-expense-amount.parser.js'

const DESCRIPTION_MAX_LENGTH = 70

export function handleNewSharedExpenseConversation(
  sharedCategoryService: SharedCategoryService,
  sharedExpenseService: SharedExpenseService,
) {
  return async function handleNewSharedExpense(
    conversation: BotConversation,
    ctx: BotConversationContext,
  ) {
    const userId = await conversation.external((ctx) => ctx.userId)
    const partnership = await conversation.external((ctx) => ctx.partnership)

    if (!partnership) {
      return ctx.reply('You are not part of a partnership yet.')
    }

    const sharedCategories = await conversation.external(() =>
      sharedCategoryService.findPartnershipSharedCategories(partnership.id),
    )

    if (sharedCategories.length === 0) {
      return ctx.reply('Create at least one shared category before adding a shared expense.')
    }

    // ── Amount ─────────────────────────────────────
    let amountCents: SharedExpenseAmountCents | null = null

    await ctx.reply(`How much did you spend?${CANCEL_HINT}`)

    do {
      const { message } = await conversation.waitFor('message:text')
      amountCents = sharedExpenseAmountParser(message.text)

      if (amountCents == null) {
        await ctx.reply('Invalid amount. Send a positive number, e.g. 12.50')
      }
    } while (amountCents == null)

    // ── Shared category ────────────────────────────
    const categoryKeyboard = new InlineKeyboard()
    for (const category of sharedCategories) {
      categoryKeyboard.text(category.name, `cat:${category.id}`).row()
    }
    await ctx.reply('Choose a shared category:', { reply_markup: categoryKeyboard })

    let sharedCategoryId: string | null = null
    let sharedCategoryName = ''

    do {
      const choice = await conversation.waitForCallbackQuery(/^cat:(.+)$/)
      const sharedCategory = sharedCategories.find((category) => category.id === choice.match[1])

      if (!sharedCategory) {
        await choice.answerCallbackQuery({ text: 'Invalid category' })
        continue
      }

      sharedCategoryId = sharedCategory.id
      sharedCategoryName = sharedCategory.name
      await choice.answerCallbackQuery()
      await choice.editMessageText(`Category: ${sharedCategoryName}`)
    } while (sharedCategoryId === null)

    // ── Split ──────────────────────────────────────
    const halfSplit = resolveSplitAmounts(amountCents, SPLIT_TYPE.HALF)
    const fullSplit = resolveSplitAmounts(amountCents, SPLIT_TYPE.FULL)
    const amountLabel = centsToString(amountCents)

    const splitKeyboard = new InlineKeyboard()
      .text(`Half ($${centsToString(halfSplit.owedAmountCents)} each)`, `split:${SPLIT_TYPE.HALF}`)
      .row()
      .text(
        `Partner owes all ($${centsToString(fullSplit.owedAmountCents)})`,
        `split:${SPLIT_TYPE.FULL}`,
      )

    await ctx.reply(`How should $${amountLabel} be split?`, { reply_markup: splitKeyboard })

    let split: SplitType | null = null

    do {
      const choice = await conversation.waitForCallbackQuery(/^split:(half|full)$/)
      const selectedSplit = choice.match[1]

      if (selectedSplit !== SPLIT_TYPE.HALF && selectedSplit !== SPLIT_TYPE.FULL) {
        await choice.answerCallbackQuery({ text: 'Invalid split' })
        continue
      }

      split = selectedSplit
      await choice.answerCallbackQuery()
      await choice.editMessageText(
        split === SPLIT_TYPE.HALF
          ? `Split: Half ($${centsToString(halfSplit.owedAmountCents)} each)`
          : `Split: Partner owes all ($${amountLabel})`,
      )
    } while (split === null)

    // ── Description (optional) ─────────────────────
    const skipKeyboard = new InlineKeyboard().text('Skip', 'desc:skip')
    await ctx.reply(`Add a description? (optional)${CANCEL_HINT}`, {
      reply_markup: skipKeyboard,
    })

    let description: string | null = null
    let descriptionDone = false

    do {
      const update = await conversation.waitFor(['message:text', 'callback_query:data'])

      if (update.callbackQuery?.data === 'desc:skip') {
        await update.answerCallbackQuery()
        await update.editMessageText('Description: skipped')
        description = null
        descriptionDone = true
        continue
      }

      if (update.callbackQuery) {
        await update.answerCallbackQuery()
        continue
      }

      const text = update.message?.text?.trim() ?? ''
      if (text.length === 0) {
        description = null
        descriptionDone = true
        continue
      }

      if (text.length > DESCRIPTION_MAX_LENGTH) {
        await ctx.reply(`Description must be at most ${DESCRIPTION_MAX_LENGTH} characters.`)
        continue
      }

      description = text
      descriptionDone = true
    } while (!descriptionDone)

    await ctx.reply('⏳ Saving your shared expense...')

    await conversation.external(() =>
      sharedExpenseService.create({
        userId,
        totalAmountCents: amountCents,
        sharedCategoryId,
        split,
        description,
      }),
    )

    const creatorSplitLabel =
      split === SPLIT_TYPE.HALF
        ? `Half ($${centsToString(halfSplit.owedAmountCents)} each)`
        : `Partner owes all ($${amountLabel})`

    const partnerSplitLabel =
      split === SPLIT_TYPE.HALF
        ? `Half ($${centsToString(halfSplit.owedAmountCents)} each)`
        : `You owe all ($${amountLabel})`

    const descriptionLine = description ? `Description: ${description}\n` : ''

    if (partnership.partnerTelegramId != null) {
      await ctx.api.sendMessage(
        partnership.partnerTelegramId,
        `Your partner added a shared expense ✅\n\n` +
          `Amount: $${amountLabel}\n` +
          `Category: ${sharedCategoryName}\n` +
          `Split: ${partnerSplitLabel}\n` +
          descriptionLine,
      )
    }

    return ctx.reply(
      `Shared expense added ✅\n\n` +
        `Amount: $${amountLabel}\n` +
        `Category: ${sharedCategoryName}\n` +
        `Split: ${creatorSplitLabel}\n` +
        descriptionLine,
    )
  }
}
