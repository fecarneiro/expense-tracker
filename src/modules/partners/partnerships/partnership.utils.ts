import { NotAPartnershipMemberError } from './partnership.errors.js'
import type { Partnership } from './partnership.types.js'

export function toCanonicalUserPair(userId1: string, userId2: string) {
  return userId1 < userId2
    ? { userAId: userId1, userBId: userId2 }
    : { userAId: userId2, userBId: userId1 }
}

export function partnerOf(partnership: Partnership, userId: string): string {
  if (partnership.userAId === userId) return partnership.userBId
  if (partnership.userBId === userId) return partnership.userAId
  throw new NotAPartnershipMemberError()
}
