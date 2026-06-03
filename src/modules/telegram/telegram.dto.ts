import { z } from 'zod'
import { emailField } from '../users/user.dto.js'

export const telegramLinkAccountInput = z.object({
  email: emailField,
  password: z.string().min(1),
  telegramId: z.bigint(),
})

export type TelegramLinkAccountInput = z.infer<typeof telegramLinkAccountInput>
