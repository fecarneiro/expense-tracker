// src/config/rate-limit.http.test.ts
import express from 'express'
import { rateLimit } from 'express-rate-limit'
import request from 'supertest'
import { expect, test } from 'vitest'

const rateLimitMessage = { message: 'Too many requests, please try again later.' }

test('returns 429 with JSON body when limit is exceeded', async () => {
  const app = express()
  const limiter = rateLimit({
    windowMs: 60_000,
    limit: 2,
    statusCode: 429,
    message: rateLimitMessage,
    skip: () => false,
  })

  app.post('/auth/login', limiter, (_req, res) => res.sendStatus(200))

  await request(app).post('/auth/login').expect(200)
  await request(app).post('/auth/login').expect(200)

  const res = await request(app).post('/auth/login').expect(429)

  expect(res.body).toEqual(rateLimitMessage)
})
