import { createApp } from './app.js'
import { createTelegramBot } from './modules/telegram/bot.js'

const port = Number(process.env.PORT ?? 3000)
const app = createApp()

createTelegramBot()

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`)
})
