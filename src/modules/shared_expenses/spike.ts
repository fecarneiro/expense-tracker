import { randomInt } from 'node:crypto'

type User = {
  id: string
}

type LinkingCode = {
  id: string
  userId: string
  code: number
}

type Partnership = {
  id: string
  userAId: string
  userBId: string
}

type Transaction = {
  id: string
  userId: string
  createdByUserId: string
  amountCents: number
}

type SharedExpense = {
  id: string
  partnershipId: string
  payerUserId: string
  owedUserId: string
  totalAmountCents: number
  owedAmountCents: number
}

const SPLIT_TYPE = {
  HALF: 'half',
  FULL: 'full',
} as const

type SplitType = (typeof SPLIT_TYPE)[keyof typeof SPLIT_TYPE]

// Entities
const userA: User = {
  id: 'AAA',
}

const userB: User = {
  id: 'BBB',
}

// Utils

function generateRandomId() {
  return randomInt(100, 999).toString()
}

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

function isMember(p: Partnership, userId: string): boolean {
  return p.userAId === userId || p.userBId === userId
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

// User A - generates linking code

function generateLinkingCode(userId: string): LinkingCode {
  return {
    id: generateRandomId(),
    code: randomInt(100_000, 1_000_000),
    userId,
  }
}

const generatedCode = generateLinkingCode(userA.id)

// console.log('User A generated linking code:\n', JSON.stringify(generatedCode, null, 2))

function validateCode(code: number): LinkingCode {
  const foundLinkingCode = code === generatedCode.code
  if (!foundLinkingCode) throw new Error('Code expired or not valid')

  return generatedCode
}

function createPartnership(userId1: string, userId2: string): Partnership {
  const { userAId, userBId } = toCanonicalUserPair(userId1, userId2)

  return {
    id: generateRandomId(),
    userAId,
    userBId,
  }
}

function CreatePartnershipUseCase(inviteeId: string, code: number): Partnership {
  const userAHasPartnership = false
  if (userAHasPartnership) throw new Error('user already has partnership')

  const { userId: userAId } = validateCode(code)

  const userBHasPartnership = false
  if (userBHasPartnership) throw new Error('user already has partnership')

  const partnership = createPartnership(userAId, inviteeId)

  if (!partnership) throw new Error('error creating your partnership')

  return partnership
}

const existingPartnership = CreatePartnershipUseCase(userB.id, generatedCode.code)
console.log('----Partnership ----\n', JSON.stringify(existingPartnership, null, 2))

// ---
const transactionsDb: Transaction[] = []
const sharedExpenses = []

function createTransaction(
  userId: string,
  amountCents: number,
  createdByUserId?: string,
): Transaction {
  const transaction = {
    id: generateRandomId(),
    userId,
    createdByUserId: createdByUserId ?? userId,
    amountCents,
  }

  transactionsDb.push(transaction)
  return transaction
}

function CreateSharedExpenseUseCase(
  userId: string,
  totalAmountCents: number,
  split: SplitType,
): SharedExpense {
  const partnership = existingPartnership
  if (!partnership) throw new Error('Partnership not found')

  const partner = partnerOf(partnership, userId)
  const owedAmountCents = resolveOwedAmount(totalAmountCents, split)

  const sharedExpense = {
    id: generateRandomId(),
    partnershipId: partnership.id,
    payerUserId: userId,
    owedUserId: partner,
    totalAmountCents,
    owedAmountCents,
  }

  sharedExpenses.push(sharedExpense)

  // createTransaction(userA.id, 200, userB.id)
  // createTransaction(userA.id, 200, userB.id)
  // create transaction (solo) will need accept createdBy

  return sharedExpense
}

// createTransaction(userA.id, 200, userB.id)
