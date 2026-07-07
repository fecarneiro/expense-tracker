import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { BotLinkingRateLimitError } from './linking-code.error.js'
import {
  LINKING_CODE_VERIFICATION_MAX_ATTEMPTS,
  LINKING_CODE_WINDOW_SIZE,
  LinkingCodeRateLimiter,
} from './linking-code-rate-limiter.js'

let rateLimiter: LinkingCodeRateLimiter
const telegramId = 1234567890

beforeEach(() => {
  rateLimiter = new LinkingCodeRateLimiter()
})

afterEach(() => {
  vi.useRealTimers()
})

test('assertAllowed does not throw when there are no recorded failures', () => {
  expect(() => rateLimiter.assertAllowed(telegramId)).not.toThrow()
})

test('assertAllowed does not throw when failures are below the max attempts', () => {
  for (let i = 0; i < LINKING_CODE_VERIFICATION_MAX_ATTEMPTS - 1; i++) {
    rateLimiter.recordFailure(telegramId)
  }
  expect(() => rateLimiter.assertAllowed(telegramId)).not.toThrow()
})

test('assertAllowed throws BotLinkingRateLimitError after max failures are recorded', () => {
  for (let i = 0; i < LINKING_CODE_VERIFICATION_MAX_ATTEMPTS; i++) {
    rateLimiter.recordFailure(telegramId)
  }

  expect(() => rateLimiter.assertAllowed(telegramId)).toThrow(BotLinkingRateLimitError)
})

test('attempts older than the window are ignored when checking the limit', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2025-01-01T12:00:00Z'))

  for (let i = 0; i < LINKING_CODE_VERIFICATION_MAX_ATTEMPTS; i++) {
    rateLimiter.recordFailure(telegramId)
  }

  expect(() => rateLimiter.assertAllowed(telegramId)).toThrow(BotLinkingRateLimitError)

  vi.advanceTimersByTime(LINKING_CODE_WINDOW_SIZE + 1)

  expect(() => rateLimiter.assertAllowed(telegramId)).not.toThrow()
})

test('clear removes recorded failures and allows new attempts', () => {
  for (let i = 0; i < LINKING_CODE_VERIFICATION_MAX_ATTEMPTS; i++) {
    rateLimiter.recordFailure(telegramId)
  }

  expect(() => rateLimiter.assertAllowed(telegramId)).toThrow(BotLinkingRateLimitError)

  rateLimiter.clear(telegramId)

  expect(() => rateLimiter.assertAllowed(telegramId)).not.toThrow()
})

test('failures for one telegramId do not affect another telegramId', () => {
  const otherTelegramId = 9876543210

  for (let i = 0; i < LINKING_CODE_VERIFICATION_MAX_ATTEMPTS; i++) {
    rateLimiter.recordFailure(telegramId)
  }

  expect(() => rateLimiter.assertAllowed(telegramId)).toThrow(BotLinkingRateLimitError)
  expect(() => rateLimiter.assertAllowed(otherTelegramId)).not.toThrow()
})
