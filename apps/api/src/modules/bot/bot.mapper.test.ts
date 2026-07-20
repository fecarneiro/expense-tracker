import { describe, expect, test } from 'vitest'
import { toGeneratedLinkingCodeResponse } from './bot.mapper.js'

describe('toGeneratedLinkingCodeResponse', () => {
  test('maps persisted linking code to API response contract', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z')

    const result = toGeneratedLinkingCodeResponse({
      code: 123_456,
      createdAt,
    })

    expect(result).toEqual({
      code: 123_456,
      createdAt: createdAt.toISOString(),
    })
  })
})
