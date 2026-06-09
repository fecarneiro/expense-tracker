import type { Conversation, ConversationFlavor } from '@grammyjs/conversations'
import type { Context } from 'grammy'

export type BotContext = ConversationFlavor<
  Context & {
    userId: string
  }
>

export type BotConversationContext = Context

export type BotConversation = Conversation<BotContext, BotConversationContext>
