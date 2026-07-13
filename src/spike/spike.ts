import { randomInt, randomUUID } from 'node:crypto'

/**
 * 1) Categories will need CategorySystemKey for uncategorized (cant be deleted), com findCategoryBySystemKey
 */

type LinkingCode = {
  id: string
  userId: string
  code: number
}

type Partnership = {
  id: string
  userAId: string
  userBId: string
  endedAt: string | null
}

type Category = {
  id: string
  userId: string
  name: string
  systemKey: CategorySystemKey | null
}

type SharedCategory = {
  id: string
  partnershipId: string
  name: string
}

type SharedCategoryMapping = {
  id: string
  userId: string
  userCategoryId: string
  sharedCategoryId: string
}

type SharedCategoryMappingInput = Omit<SharedCategoryMapping, 'id'>

type Transaction = {
  id: string
  userId: string
  createdByUserId: string
  amountCents: number
  categoryId: string
}

type SharedExpense = {
  id: string
  partnershipId: string
  payerUserId: string
  owedUserId: string
  totalAmountCents: number
  owedAmountCents: number
  sharedCategoryId: string
}

type CreateSharedExpense = {
  userId: string
  totalAmountCents: number
  sharedCategoryId: string
  split: SplitType
}

const SPLIT_TYPE = {
  HALF: 'half',
  FULL: 'full',
} as const

type SplitType = (typeof SPLIT_TYPE)[keyof typeof SPLIT_TYPE]

const SHARED_CATEGORY_DEFAULTS = [
  { name: 'Eating Out' },
  { name: 'Grocery' },
  { name: 'House' },
  { name: 'Other' },
]

export const CATEGORY_SYSTEM_KEY = {
  UNCATEGORIZED: 'uncategorized',
} as const

type CategorySystemKey = (typeof CATEGORY_SYSTEM_KEY)[keyof typeof CATEGORY_SYSTEM_KEY]

// DB
type InMemoryDatabase = {
  linkingCodes: LinkingCode[]
  partnerships: Partnership[]
  categories: Category[]
  sharedCategories: SharedCategory[]
  sharedCategoryMappings: SharedCategoryMapping[]
  transactions: Transaction[]
  sharedExpenses: SharedExpense[]
}

export const db: InMemoryDatabase = {
  linkingCodes: [],
  partnerships: [],
  categories: [],
  sharedCategories: [],
  sharedCategoryMappings: [],
  transactions: [],
  sharedExpenses: [],
}

function findCategoryByIdRepository(userId: string, categoryId: string): Category {
  const found = db.categories.find((c) => c.id === categoryId && c.userId === userId)
  if (!found) throw new Error('category not found')
  return found
}

export function findSharedCategoryByIdRepository(
  partnershipId: string,
  sharedCategoryId: string,
): SharedCategory {
  const found = db.sharedCategories.find(
    (c) => c.partnershipId === partnershipId && c.id === sharedCategoryId,
  )
  if (!found) throw new Error('shared category not found')
  return found
}

function findActivePartnershipByUserId(userId: string): Partnership | null {
  const found = db.partnerships.find(
    (p) => (p.userAId === userId || p.userBId === userId) && p.endedAt == null,
  )
  return found ?? null
}

function findCategoryBySystemKeyRepository(userId: string, systemKey: string) {
  const found = db.categories.find((c) => c.userId === userId && c.systemKey === systemKey)
  if (!found) throw new Error('system category not found')
  return found
}

function findUserMappedCategoryRepository(
  userId: string,
  sharedCategoryId: string,
): SharedCategoryMapping | null {
  const found = db.sharedCategoryMappings.find(
    (sc) => sc.userId === userId && sc.id === sharedCategoryId,
  )
  if (!found) return null
  return found
}

// Utils
function toCanonicalUserPair(userId1: string, userId2: string) {
  //(AAA, BBB) e (BBB, AAA) are the same, good for idx
  if (userId1 === userId2) throw new Error('users must be different')

  return userId1 < userId2
    ? { userAId: userId1, userBId: userId2 }
    : { userAId: userId2, userBId: userId1 }
}

function partnerOf(p: Partnership, userId: string): string {
  if (p.userAId === userId) return p.userBId
  if (p.userBId === userId) return p.userAId
  throw new Error('not a member')
}

function resolveOwedAmount(totalAmountCents: number, split: SplitType) {
  if (split === SPLIT_TYPE.FULL) {
    return totalAmountCents
  }
  if (split === SPLIT_TYPE.HALF) {
    return totalAmountCents / 2
  }
  throw new Error('split type not valid')
}

function resolveMappedCategory(userId: string, sharedCategoryId: string): Category {
  const mapped = findUserMappedCategoryRepository(userId, sharedCategoryId) // nullable
  if (mapped) {
    return findCategoryByIdRepository(userId, mapped.userCategoryId)
  }
  return findCategoryBySystemKeyRepository(userId, CATEGORY_SYSTEM_KEY.UNCATEGORIZED)
}

function hasActivePartnership(userId: string): boolean {
  return db.partnerships.some(
    (p) => (p.userAId === userId || p.userBId === userId) && p.endedAt === null,
  )
}

// Module functions
export function generateLinkingCode(userId: string): LinkingCode {
  const code = {
    id: randomUUID(),
    code: randomInt(100_000, 1_000_000),
    userId,
  }
  db.linkingCodes.push(code)
  return code
}

function validateLinkingCode(code: number): LinkingCode {
  const existingCode = db.linkingCodes[0]
  if (!existingCode) throw new Error('Code not found')

  const validateCode = existingCode.code === code
  if (!validateCode) throw new Error('Code expired or not valid')

  return existingCode
}

function createTransaction(
  userId: string,
  amountCents: number,
  categoryId: string,
  createdByUserId?: string,
): Transaction {
  const transaction = {
    id: randomUUID(),
    userId,
    createdByUserId: createdByUserId ?? userId,
    amountCents,
    categoryId,
  }

  db.transactions.push(transaction)
  return transaction
}

function createPartnershipRepository(userId1: string, userId2: string): Partnership {
  const { userAId, userBId } = toCanonicalUserPair(userId1, userId2)

  const result = {
    id: randomUUID(),
    userAId,
    userBId,
    endedAt: null,
  }

  db.partnerships.push(result)
  return result
}

function createSharedCategoryDefaults(partnershipId: string): SharedCategory[] {
  const cats = SHARED_CATEGORY_DEFAULTS.map((cat, index) => ({
    id: `${index + 1}-SCAT`,
    partnershipId,
    name: cat.name,
  }))
  db.sharedCategories.push(...cats)
  return cats
}

export function createPartnership(inviteeId: string, code: number): Partnership {
  const { userId: inviterId } = validateLinkingCode(code)

  if (inviterId === inviteeId) throw new Error('Cannot create a partnership with yourself')

  if (hasActivePartnership(inviteeId)) {
    throw new Error('Invitee already has an active partnership')
  }

  if (hasActivePartnership(inviterId)) {
    throw new Error('Inviter already has an active partnership')
  }

  const partnership = createPartnershipRepository(inviterId, inviteeId)

  createSharedCategoryDefaults(partnership.id)

  return partnership
}

export function createSharedCategoryMapping(
  input: SharedCategoryMappingInput,
): SharedCategoryMapping {
  const mapped = {
    id: randomUUID(),
    userId: input.userId,
    userCategoryId: input.userCategoryId,
    sharedCategoryId: input.sharedCategoryId,
  }
  db.sharedCategoryMappings.push(mapped)
  return mapped
}

export function createSharedExpense(input: CreateSharedExpense): SharedExpense {
  const { userId, sharedCategoryId, totalAmountCents, split } = input
  const partnership = findActivePartnershipByUserId(userId)
  if (!partnership) throw new Error('Partnership not found')

  const sharedCategory = findSharedCategoryByIdRepository(partnership.id, sharedCategoryId)
  if (!sharedCategory) throw new Error('Shared category not found')

  const partnerId = partnerOf(partnership, userId)
  const owedAmountCents = resolveOwedAmount(totalAmountCents, split)

  // EVERYTHING BELLOW MUST BE A TX IN DB
  const sharedExpense = {
    id: randomUUID(),
    partnershipId: partnership.id,
    sharedCategoryId,
    payerUserId: userId,
    owedUserId: partnerId,
    totalAmountCents,
    owedAmountCents,
  }
  db.sharedExpenses.push(sharedExpense)

  const userCategory = resolveMappedCategory(userId, sharedCategoryId)
  const partnerCategory = resolveMappedCategory(partnerId, sharedCategoryId)

  if (split === SPLIT_TYPE.FULL) {
    createTransaction(partnerId, owedAmountCents, partnerCategory.id, userId)
    // return owed
  }

  if (split === SPLIT_TYPE.HALF) {
    const halfAmount = totalAmountCents / 2
    createTransaction(userId, halfAmount, userCategory.id, userId)
    createTransaction(partnerId, halfAmount, partnerCategory.id)

    // return
  }

  return sharedExpense
}
