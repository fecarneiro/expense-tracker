import { z } from 'zod'
import { DEFAULT_TELEGRAM_BOT_USERNAME } from '../telegram.constants.js'

const botUsernameSchema = z
  .string()
  .min(1)
  .default(DEFAULT_TELEGRAM_BOT_USERNAME)
  .transform((value) => value.trim().replace(/^@/, ''))

const telegramPollingSchema = z.object({
  mode: z.literal('polling'),
  botToken: z.string().min(1),
  botUsername: botUsernameSchema,
})

const telegramWebhookSchema = z.object({
  mode: z.literal('webhook'),
  botToken: z.string().min(1),
  botUsername: botUsernameSchema,

  appUrl: z.url(),
  webhookSecret: z.string().min(1),
})

export type TelegramRuntimeConfig =
  | z.infer<typeof telegramPollingSchema>
  | z.infer<typeof telegramWebhookSchema>

export function parseTelegramEnv(nodeEnv: string): TelegramRuntimeConfig | null {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim()
  if (!botToken) return null

  if (nodeEnv === 'production') {
    return telegramWebhookSchema.parse({
      mode: 'webhook',
      botToken,
      botUsername: process.env.TELEGRAM_BOT_USERNAME,
      appUrl: process.env.APP_URL,
      webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET,
    })
  }

  return telegramPollingSchema.parse({
    mode: 'polling',
    botToken,
    botUsername: process.env.TELEGRAM_BOT_USERNAME,
  })
}
