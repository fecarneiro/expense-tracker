import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { LINKING_CODE } from './linking-code.constants.js'
import { InvalidOrExpiredLinkingCodeError } from './linking-code.error.js'
import type { LinkingCodeRepository } from './linking-code.repository.js'
import { LinkingCodeService } from './linking-code.service.js'

const code = 123_456
const userId = 'user-id'

let linkingCodeRepository: LinkingCodeRepository
let linkingCodeService: LinkingCodeService

beforeEach(() => {
  linkingCodeRepository = {
    save: vi.fn(),
    find: vi.fn(),
    delete: vi.fn(),
  } as unknown as LinkingCodeRepository

  linkingCodeService = new LinkingCodeService(linkingCodeRepository)
})

afterEach(() => {
  vi.useRealTimers()
})

test('verify returns userId when code is valid', async () => {
  vi.mocked(linkingCodeRepository.find).mockResolvedValue({
    id: 'code-id',
    userId,
    code,
    purpose: 'bot_link',
    createdAt: new Date(),
  })

  const result = await linkingCodeService.verify({ code, purpose: 'bot_link' })

  expect(result).toEqual({ userId })
})

test('verify throws and records failure when code is not found', async () => {
  vi.mocked(linkingCodeRepository.find).mockResolvedValue(null)

  await expect(linkingCodeService.verify({ code, purpose: 'bot_link' })).rejects.toThrow(
    InvalidOrExpiredLinkingCodeError,
  )
})

test('verify throws and records failure when code is expired', async () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2025-01-01T12:00:00Z'))

  vi.mocked(linkingCodeRepository.find).mockResolvedValue({
    id: 'code-id',
    userId,
    code,
    purpose: 'bot_link',
    createdAt: new Date('2025-01-01T12:00:00Z'),
  })

  vi.advanceTimersByTime(LINKING_CODE.TTL_MS + 1)

  await expect(linkingCodeService.verify({ code, purpose: 'bot_link' })).rejects.toThrow(
    InvalidOrExpiredLinkingCodeError,
  )
})
