export interface TelegramAccount {
  id: string
  userId: string
  telegramId: number
  createdAt: Date
}

export type LinkTelegramAccountInput = {
  email: string
  password: string
  telegramId: number
}

export type LinkTelegramAccountRepositoryInput = Pick<TelegramAccount, 'userId' | 'telegramId'>

export type FindAccountByTelegramIdInput = Pick<TelegramAccount, 'telegramId'>

export type TelegramUserIdentity = Pick<TelegramAccount, 'userId'>

export type VerifyAndLinkAccountInput = {
  telegramId: number
  code: number
}
