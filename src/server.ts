import { createApp } from './app.js'
import { env } from './config/env.config.js'
import { createContainer } from './container.js'
import { db, pool } from './database/db.js'
import { createTelegramBot } from './modules/telegram/bot.js'

const container = createContainer(db)
const app = createApp(container)
const bot = createTelegramBot(container)

bot.start()

const server = app.listen(env.PORT, () => {
  console.log(`Server is running on port: ${env.PORT}`)
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
