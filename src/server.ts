import { webhookCallback } from 'grammy'
import { createApp } from './app.js'
import { env } from './config/app.config.js'
import { createContainer } from './container.js'
import { db, pool } from './database/db.js'
import { createTelegramBot } from './modules/telegram/bot.js'
import { parseTelegramEnv } from './modules/telegram/config/telegram.config.js'
import { logger } from './shared/logger/logger.js'

const container = createContainer(db)
const app = createApp(container)

const telegramConfig = parseTelegramEnv(env.NODE_ENV)
const bot = telegramConfig ? createTelegramBot(container, telegramConfig) : null

if (bot && telegramConfig?.mode === 'webhook') {
  app.use(`/${telegramConfig.webhookSecret}`, webhookCallback(bot, 'express'))
}

const server = app.listen(env.PORT, async () => {
  logger.info({ port: env.PORT }, 'server.started')

  if (!bot || !telegramConfig) {
    logger.info('telegram.bot.disabled')
    return
  }

  if (telegramConfig.mode === 'webhook') {
    try {
      await bot.api.setWebhook(`${telegramConfig.appUrl}/${telegramConfig.webhookSecret}`)
      logger.info({ mode: 'webhook' }, 'telegram.webhook.set')
    } catch (err) {
      logger.error({ err }, 'telegram.webhook.set_failed')
    }
  } else {
    bot.start().catch((err) => {
      logger.error({ err }, 'telegram.bot.start_failed')
    })

    logger.info({ mode: 'polling' }, 'telegram.bot.polling.started')
  }
})

async function shutdown(signal: string) {
  logger.info({ signal }, 'server.shutdown.started')
  if (bot) await bot.stop()
  server.close()
  await pool.end()
  process.exit(0)
}

process.once('SIGINT', () => shutdown('SIGINT'))
process.once('SIGTERM', () => shutdown('SIGTERM'))
