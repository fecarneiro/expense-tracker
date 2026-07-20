import type { Conversation, ConversationFlavor } from '@grammyjs/conversations'
import type { Context } from 'grammy'
import type pino from 'pino'
import type { PartnershipContext } from '../partners/partnerships/partnership.service.js'

export type BotContext = ConversationFlavor<
  Context & {
    logger: pino.Logger
    userId: string
    partnership: PartnershipContext | null
  }
>

export type BotConversationContext = Context

export type BotConversation = Conversation<BotContext, BotConversationContext>
