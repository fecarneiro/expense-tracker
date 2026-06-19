import type { Express } from 'express'
import {
  getTelegramBotMobileUrl,
  getTelegramBotWebUrl,
  TELEGRAM_BOT_PUBLIC_PATH,
} from '../telegram.constants.js'

export function registerTelegramPublicRoutes(app: Express, botUsername: string) {
  const mobileUrl = getTelegramBotMobileUrl(botUsername)
  const webUrl = getTelegramBotWebUrl(botUsername)

  app.get(TELEGRAM_BOT_PUBLIC_PATH, (req, res) => {
    const userAgent = req.get('user-agent') ?? ''
    const isMobile = /Android|iPhone|iPad|Mobile/i.test(userAgent)
    res.set('Cache-Control', 'no-store')
    res.redirect(302, isMobile ? mobileUrl : webUrl)
  })
}
