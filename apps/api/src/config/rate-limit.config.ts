import { type Options, rateLimit } from 'express-rate-limit'
import { isDevelopment, isTest } from './app.config.js'

const baseOptions = {
  windowMs: 15 * 60 * 1000,
  statusCode: 429,
  message: { message: 'Too many requests, please try again later.' },
  skip: () => isTest || isDevelopment,
} satisfies Partial<Options>

export const globalRateLimiter = rateLimit({ ...baseOptions, limit: 300 })
export const authRateLimiter = rateLimit({ ...baseOptions, limit: 10 })
