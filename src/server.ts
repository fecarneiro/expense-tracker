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
const shutdownTimeoutMs = 10_000

const telegramWebhookPath = '/webhooks/telegram'

if (bot && telegramConfig?.mode === 'webhook') {
  app.post(
    telegramWebhookPath,
    webhookCallback(bot, 'express', {
      secretToken: telegramConfig.webhookSecret,
    }),
  )
}

async function warmUpDatabase() {
  const databaseWarmupStartedAt = Date.now()
  try {
    await pool.query('SELECT 1')
    logger.info({ durationMs: Date.now() - databaseWarmupStartedAt }, 'database.connection.ready')
  } catch (err) {
    logger.error(
      { err, durationMs: Date.now() - databaseWarmupStartedAt },
      'database.connection.failed',
    )
  }
}

const server = app.listen(env.PORT, async () => {
  logger.info({ port: env.PORT }, 'server.started')

  await warmUpDatabase()

  if (!bot || !telegramConfig) {
    logger.info('telegram.bot.disabled')
    return
  }

  if (telegramConfig.mode === 'webhook') {
    try {
      await bot.api.setWebhook(`${telegramConfig.appUrl}${telegramWebhookPath}`, {
        secret_token: telegramConfig.webhookSecret,
      })

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

server.on('error', (err) => {
  logger.error({ err }, 'server.start_failed')
})

async function shutdown(signal: string) {
  logger.info({ signal }, 'server.shutdown.started')

  const shutdownTimeout = setTimeout(() => {
    logger.error({ signal, timeoutMs: shutdownTimeoutMs }, 'server.shutdown.timeout')
    process.exit(1)
  }, shutdownTimeoutMs)

  try {
    if (bot) await bot.stop()

    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) {
          reject(err)
          return
        }

        resolve()
      })
    })

    await pool.end()

    clearTimeout(shutdownTimeout)
    logger.info({ signal }, 'server.shutdown.completed')
    process.exit(0)
  } catch (err) {
    clearTimeout(shutdownTimeout)
    logger.error({ err, signal }, 'server.shutdown.failed')
    process.exit(1)
  }
}

process.once('SIGINT', () => void shutdown('SIGINT'))
process.once('SIGTERM', () => void shutdown('SIGTERM'))

process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'process.unhandled_rejection')
})

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'process.uncaught_exception')
  process.exit(1)
})
