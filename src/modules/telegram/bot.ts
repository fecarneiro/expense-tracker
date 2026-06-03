import { Bot } from 'grammy'
import { env } from '../../config/env.config.js'

const botToken = env.TELEGRAM_BOT_TOKEN

export function createTelegramBot() {
  console.log('bot started')
  const bot = new Bot(botToken)

  bot.command('start', (ctx) => ctx.reply('Welcome! Up and running.'))

  bot.on('message', (ctx) => {
    console.log(ctx.message)
    ctx.reply('Got another message!')
  })

  bot.start()
}
