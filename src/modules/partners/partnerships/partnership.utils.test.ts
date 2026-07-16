import { expect, test } from 'vitest'
import { NotAPartnershipMemberError } from './partnership.errors.js'
import type { Partnership } from './partnership.types.js'
import { partnerOf, toCanonicalUserPair } from './partnership.utils.js'

const userAId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
const userBId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'

const partnership = {
  id: 'partnership-id',
  userAId,
  userBId,
  endedAt: null,
  createdAt: new Date(),
} satisfies Partnership

test('toCanonicalUserPair orders ids lexicographically', () => {
  expect(toCanonicalUserPair(userBId, userAId)).toStrictEqual({ userAId, userBId })
  expect(toCanonicalUserPair(userAId, userBId)).toStrictEqual({ userAId, userBId })
})

test('partnerOf returns the other member', () => {
  expect(partnerOf(partnership, userAId)).toBe(userBId)
  expect(partnerOf(partnership, userBId)).toBe(userAId)
})

test('partnerOf throws when user is not a member', () => {
  expect(() => partnerOf(partnership, 'cccccccc-cccc-cccc-cccc-cccccccccccc')).toThrow(
    NotAPartnershipMemberError,
  )
})
