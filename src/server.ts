import { webhookCallback } from 'grammy'
import { createApp } from './app.js'
import { env } from './config/app.config.js'
import { createContainer } from './container.js'
import { db, pool } from './database/db.js'
import { createTelegramBot } from './modules/telegram/bot.js'
import { parseTelegramEnv } from './modules/telegram/config/telegram.config.js'
import { registerTelegramPublicRoutes } from './modules/telegram/http/telegram-public.routes.js'

const container = createContainer(db)
const app = createApp(container)
const telegramConfig = parseTelegramEnv(env.NODE_ENV)
const bot = telegramConfig ? createTelegramBot(container, telegramConfig) : null

if (telegramConfig) {
  registerTelegramPublicRoutes(app, telegramConfig.botUsername)
}

if (bot && telegramConfig?.mode === 'webhook') {
  app.use(`/${telegramConfig.webhookSecret}`, webhookCallback(bot, 'express'))
}

const server = app.listen(env.PORT, async () => {
  console.log(`Server is running on port: ${env.PORT}`)
  if (!bot || !telegramConfig) {
    console.log('Telegram bot disabled (TELEGRAM_BOT_TOKEN not set).')
    return
  }
  if (telegramConfig.mode === 'webhook') {
    await bot.api.setWebhook(`${telegramConfig.appUrl}/${telegramConfig.webhookSecret}`)
    console.log(`Webhook set to: ${telegramConfig.appUrl}`)
  } else {
    bot.start().catch((error) => {
      console.error('Telegram bot failed to start. API server will keep running.', error)
    })
    console.log('Bot started in long-polling mode.')
  }
})

async function shutdown(signal: string) {
  console.log(`\n${signal} received, shutting down...`)
  if (bot) await bot.stop()
  server.close()
  await pool.end()
  process.exit(0)
}

process.once('SIGINT', () => shutdown('SIGINT'))
process.once('SIGTERM', () => shutdown('SIGTERM'))
