import { type Options, rateLimit } from 'express-rate-limit'
import { isTest } from './app.config.js'

const baseOptions = {
  windowMs: 15 * 60 * 1000,
  statusCode: 429,
  message: { message: 'Too many requests, please try again later.' },
  skip: () => isTest,
} satisfies Partial<Options>

export const globalRateLimiter = rateLimit({ ...baseOptions, limit: 100 })
export const authRateLimiter = rateLimit({ ...baseOptions, limit: 10 })
