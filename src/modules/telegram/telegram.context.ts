import type { Conversation, ConversationFlavor } from '@grammyjs/conversations'
import type { Context } from 'grammy'
import type pino from 'pino'

export type BotContext = ConversationFlavor<
  Context & {
    userId: string
    logger: pino.Logger
  }
>

export type BotConversationContext = Context

export type BotConversation = Conversation<BotContext, BotConversationContext>
