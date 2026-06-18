import * as z from 'zod'
import { emailField, userIdField } from '../../users/http/user.http.dto.js'

export const telegramIdField = z.int().positive().meta({
  description: 'Telegram user id. Group ids are negative and are not accepted.',
  example: 1234567890,
})

export const telegramAccountIdField = z.uuid().meta({
  example: 'b3e1c9a2-7a7a-4f5a-9e0d-15b2d4c1a001',
})

export const linkingCodeField = z.number().int().min(100_000).max(999_999).meta({
  example: 123456,
})

export const linkTelegramAccountBodySchema = z
  .strictObject({
    email: emailField,
    password: z.string().min(1),
    telegramId: telegramIdField,
  })
  .meta({
    id: 'LinkTelegramAccountBody',
  })

export const telegramHttpResponseSchema = z
  .object({
    id: telegramAccountIdField,
    userId: userIdField,
    telegramId: telegramIdField,
    createdAt: z.date(),
  })
  .meta({
    id: 'TelegramAccount',
  })

export const generatedLinkingCodeHttpResponseSchema = z
  .object({
    code: linkingCodeField,
    createdAt: z.date(),
  })
  .meta({
    id: 'GeneratedTelegramLinkingCode',
  })
