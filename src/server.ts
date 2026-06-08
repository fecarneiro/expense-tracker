import { createApp } from './app.js'
import { env } from './config/env.config.js'
import { createContainer } from './container.js'
import { db } from './database/db.js'
import { createTelegramBot } from './modules/telegram/bot.js'

const container = createContainer(db)
const app = createApp(container)
createTelegramBot(container)

app.listen(env.PORT, () => {
  console.log(`Server is running on port: ${env.PORT}`)
})
