import express from 'express'
import request from 'supertest'
import { expect, test } from 'vitest'
import { TELEGRAM_BOT_PUBLIC_PATH } from '../telegram.constants.js'
import { registerTelegramPublicRoutes } from './telegram-public.routes.js'

const botUsername = 'my_test_bot'

function createTestApp() {
  const app = express()
  registerTelegramPublicRoutes(app, botUsername)
  return app
}

test('GET /redirect-to-bot redirects desktop clients to Telegram Web', async () => {
  const app = createTestApp()

  const res = await request(app)
    .get(TELEGRAM_BOT_PUBLIC_PATH)
    .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X)')
    .expect(302)

  expect(res.headers.location).toBe(`https://web.telegram.org/k/#@${botUsername}`)
  expect(res.headers['cache-control']).toBe('no-store')
})

test('GET /redirect-to-bot redirects mobile clients to t.me', async () => {
  const app = createTestApp()

  const res = await request(app)
    .get(TELEGRAM_BOT_PUBLIC_PATH)
    .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')
    .expect(302)

  expect(res.headers.location).toBe(`https://t.me/${botUsername}`)
})
