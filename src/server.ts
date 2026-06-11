import { webhookCallback } from 'grammy'
import { createApp } from './app.js'
import { env, isProduction } from './config/env.config.js'
import { createContainer } from './container.js'
import { db, pool } from './database/db.js'
import { createTelegramBot } from './modules/telegram/bot.js'

const container = createContainer(db)
const app = createApp(container)
const bot = createTelegramBot(container)

if (isProduction) {
  app.use(`/${env.TELEGRAM_BOT_TOKEN}`, webhookCallback(bot, 'express'))
}

const server = app.listen(env.PORT, async () => {
  console.log(`Server is running on port: ${env.PORT}`)

  if (isProduction) {
    await bot.api.setWebhook(`${env.APP_URL}/${env.TELEGRAM_BOT_TOKEN}`)
    console.log(`Webhook set to: ${env.APP_URL}`)
  } else {
    bot.start() // long polling
    console.log('Bot started in long-polling mode.')
  }
})

async function shutdown(signal: string) {
  console.log(`\n${signal} received, shutting down...`)
  await bot.stop()
  server.close()
  await pool.end()
  process.exit(0)
}

process.once('SIGINT', () => shutdown('SIGINT'))
process.once('SIGTERM', () => shutdown('SIGTERM'))
