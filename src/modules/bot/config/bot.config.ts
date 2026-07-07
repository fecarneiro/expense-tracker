import { z } from 'zod'

const botPollingSchema = z.object({
  mode: z.literal('polling'),
  botToken: z.string().min(1),
})
const botWebhookSchema = z.object({
  mode: z.literal('webhook'),
  botToken: z.string().min(1),
  appUrl: z.url(),
  webhookSecret: z.string().min(1),
})

export type BotRuntimeConfig = z.infer<typeof botPollingSchema> | z.infer<typeof botWebhookSchema>

export function parseBotEnv(nodeEnv: string): BotRuntimeConfig | null {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim()
  if (!botToken) return null

  if (nodeEnv === 'production') {
    return botWebhookSchema.parse({
      mode: 'webhook',
      botToken,
      appUrl: process.env.APP_URL,
      webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET,
    })
  }

  return botPollingSchema.parse({
    mode: 'polling',
    botToken,
  })
}
