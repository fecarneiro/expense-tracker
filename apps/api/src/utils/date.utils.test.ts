import { describe, expect, test } from 'vitest'
import { isoDateTimeToReadable } from './date.utils.js'

describe('isoDateTimeToReadable', () => {
  const lateInUtc = '2026-11-01T01:00:00.000Z'

  test('uses the given time zone', () => {
    expect(isoDateTimeToReadable(lateInUtc, 'UTC')).toBe('Nov 01, 2026')
    expect(isoDateTimeToReadable(lateInUtc, 'America/Sao_Paulo')).toBe('Oct 31, 2026')
    expect(isoDateTimeToReadable('2026-11-30T20:00:00.000Z', 'Asia/Tokyo')).toBe('Dec 01, 2026')
  })
})
