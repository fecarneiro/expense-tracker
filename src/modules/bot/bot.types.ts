export interface BotAccount {
  id: string
  userId: string
  telegramId: number
  createdAt: Date
}

export type LinkBotAccountRepositoryInput = Pick<BotAccount, 'userId' | 'telegramId'>

export type FindAccountByTelegramIdInput = Pick<BotAccount, 'telegramId'>

export type BotUserIdentity = Pick<BotAccount, 'userId'>

export type VerifyAndLinkAccountInput = {
  telegramId: number
  code: number
}
