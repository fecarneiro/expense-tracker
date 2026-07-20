import { describe, expect, test } from 'vitest'
import { TEST_EMAIL } from '../../tests/constants.js'
import {
  DEFAULT_USER_CURRENCY,
  DEFAULT_USER_LOCALE,
  DEFAULT_USER_TIME_ZONE,
} from './user.constants.js'
import { toUserPreferences, toUserResponse } from './user.mapper.js'

describe('toUserResponse', () => {
  test('maps persisted row to API response contract', () => {
    const result = toUserResponse({
      id: '019e8885-153c-7c82-af4a-28a31559e01e',
      email: TEST_EMAIL,
      passwordHash: 'hashed-password',
      timeZone: DEFAULT_USER_TIME_ZONE,
      currency: DEFAULT_USER_CURRENCY,
      locale: DEFAULT_USER_LOCALE,
      lastSeenAt: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    })

    expect(result).toEqual({
      id: '019e8885-153c-7c82-af4a-28a31559e01e',
      email: TEST_EMAIL,
      timezone: DEFAULT_USER_TIME_ZONE,
      currency: DEFAULT_USER_CURRENCY,
      locale: DEFAULT_USER_LOCALE,
      lastSeenAt: null,
    })
  })

  test('serializes lastSeenAt to ISO string', () => {
    const lastSeenAt = new Date('2026-03-15T12:00:00.000Z')

    const result = toUserResponse({
      id: '019e8885-153c-7c82-af4a-28a31559e01e',
      email: TEST_EMAIL,
      passwordHash: 'hashed-password',
      timeZone: DEFAULT_USER_TIME_ZONE,
      currency: DEFAULT_USER_CURRENCY,
      locale: DEFAULT_USER_LOCALE,
      lastSeenAt,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    })

    expect(result.lastSeenAt).toBe(lastSeenAt.toISOString())
  })
})

describe('toUserPreferences', () => {
  test('maps user preference fields', () => {
    const result = toUserPreferences({
      timeZone: 'America/New_York',
      locale: 'en-US',
      currency: 'USD',
    })

    expect(result).toEqual({
      timeZone: 'America/New_York',
      locale: 'en-US',
      currency: 'USD',
    })
  })
})
