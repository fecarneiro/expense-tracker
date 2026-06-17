import { z } from 'zod'
import { emailField } from '../../users/http/user.http.dto.js'

const telegramIdField = z.int().positive() // group id are negative

export const telegramBaseSchema = z.object({
  email: emailField,
  password: z.string().min(1),
  telegramId: telegramIdField,
})

export const linkTelegramAccountSchema = telegramBaseSchema

export const getUserIdByTelegramIdSchema = z.object({
  telegramId: telegramIdField,
})

export type LinkTelegramAccountData = z.infer<typeof telegramBaseSchema>

export type GetUserIdByTelegramIdData = z.infer<typeof getUserIdByTelegramIdSchema>
