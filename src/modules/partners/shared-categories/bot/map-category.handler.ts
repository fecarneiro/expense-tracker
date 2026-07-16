import { InlineKeyboard } from 'grammy'
import type { BotConversation, BotConversationContext } from '../../../bot/bot.context.js'
import { CANCEL_HINT } from '../../../bot/handlers/cancel.handler.js'
import type { CategoryService } from '../../../categories/category.service.js'
import type { SharedCategoryService } from '../shared-category.service.js'

export function handleMapCategoryConversation(
  sharedCategoryService: SharedCategoryService,
  categoryService: CategoryService,
) {
  return async function handleMapCategory(
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
      return ctx.reply('Create at least one shared category before mapping.')
    }

    // ── Shared category ────────────────────────────
    const sharedKeyboard = new InlineKeyboard()
    for (const category of sharedCategories) {
      sharedKeyboard.text(category.name, `shared:${category.id}`).row()
    }
    await ctx.reply(`Choose a shared category to map:${CANCEL_HINT}`, {
      reply_markup: sharedKeyboard,
    })

    let sharedCategoryId: string | null = null
    let sharedCategoryName = ''

    do {
      const choice = await conversation.waitForCallbackQuery(/^shared:(.+)$/)
      const sharedCategory = sharedCategories.find((category) => category.id === choice.match[1])

      if (!sharedCategory) {
        await choice.answerCallbackQuery({ text: 'Invalid category' })
        continue
      }

      sharedCategoryId = sharedCategory.id
      sharedCategoryName = sharedCategory.name
      await choice.answerCallbackQuery()
      await choice.editMessageText(`Shared category: ${sharedCategoryName}`)
    } while (sharedCategoryId === null)

    // ── User category ──────────────────────────────
    const userCategories = await conversation.external(() =>
      categoryService.findByType({ userId, categoryType: 'expense' }),
    )

    if (userCategories.length === 0) {
      return ctx.reply('Create at least one expense category before mapping.')
    }

    const userKeyboard = new InlineKeyboard()
    for (const category of userCategories) {
      userKeyboard.text(category.name, `ucat:${category.id}`).row()
    }
    await ctx.reply(`Choose your category that matches <b>${sharedCategoryName}</b>:`, {
      parse_mode: 'HTML',
      reply_markup: userKeyboard,
    })

    let userCategoryId: string | null = null
    let userCategoryName = ''

    do {
      const choice = await conversation.waitForCallbackQuery(/^ucat:(.+)$/)
      const userCategory = userCategories.find((category) => category.id === choice.match[1])

      if (!userCategory) {
        await choice.answerCallbackQuery({ text: 'Invalid category' })
        continue
      }

      userCategoryId = userCategory.id
      userCategoryName = userCategory.name
      await choice.answerCallbackQuery()
      await choice.editMessageText('⏳ Saving mapping...')
    } while (userCategoryId === null)

    await conversation.external(() =>
      sharedCategoryService.mapUserCategoryToShared({
        userId,
        partnershipId: partnership.id,
        userCategoryId,
        sharedCategoryId,
      }),
    )

    return ctx.reply(`Mapped <b>${userCategoryName}</b> → <b>${sharedCategoryName}</b> ✅`, {
      parse_mode: 'HTML',
    })
  }
}
