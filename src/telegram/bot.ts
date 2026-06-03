import { Bot } from 'grammy'

const botToken = process.env.TELEGRAM_BOT_TOKEN

if (!botToken) {
  throw new Error('TELEGRAM_BOT_TOKEN missing')
}
console.log('Telegram bot initialized')

const bot = new Bot(botToken)

bot.command('start', (ctx) => ctx.reply('Welcome! Up and running.'))

bot.on('message', (ctx) => ctx.reply('Got another message!'))

bot.start()
