import { z } from 'zod'
import { categoryNameField } from '../categories/category.dto.js'
import { transactionAmountInCentsField } from '../transactions/transaction.dto.js'
import { emailField } from '../users/user.dto.js'

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

export const createNewTransactionFromTelegramSchema = z.object({
  categoryName: categoryNameField,
  amountInCents: transactionAmountInCentsField,
})

export type LinkTelegramAccountData = z.infer<typeof telegramBaseSchema>

export type GetUserIdByTelegramIdData = z.infer<typeof getUserIdByTelegramIdSchema>

export type CreateNewTransactionFromTelegramData = z.infer<
  typeof createNewTransactionFromTelegramSchema
>
