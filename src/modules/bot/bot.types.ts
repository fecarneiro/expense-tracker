export interface BotAccount {
  id: string
  userId: string
  telegramId: number
  createdAt: Date
}

export type LinkBotAccountRepositoryInput = Pick<BotAccount, 'userId' | 'telegramId'>

export type BotUserIdentity = Pick<BotAccount, 'userId'>
