import { beforeEach, describe, expect, it } from 'vitest'
import {
  CATEGORY_SYSTEM_KEY,
  createPartnership,
  createSharedExpense,
  db,
  findSharedCategoryByIdRepository,
  generateLinkingCode,
} from './spike.js'

function resetDb() {
  db.categories = []
  db.linkingCodes = []
  db.partnerships = []
  db.sharedCategories = []
  db.sharedCategoryMappings = []
  db.sharedExpenses = []
  db.transactions = []
}

function seedPartneredUsers() {
  const alice = { id: 'ID-ALICE' }
  const bob = { id: 'ID-BOB' }

  db.categories.push(
    { id: 'A-FOOD', userId: alice.id, name: 'Food', systemKey: null },
    {
      id: 'ALICE-UNCATEGORIZED',
      userId: alice.id,
      name: 'Uncategorized',
      systemKey: CATEGORY_SYSTEM_KEY.UNCATEGORIZED,
    },
    { id: 'BOB-DINNER', userId: bob.id, name: 'Dinner', systemKey: null },
    {
      id: 'BOB-UNCATEGORIZED',
      userId: bob.id,
      name: 'Uncategorized',
      systemKey: CATEGORY_SYSTEM_KEY.UNCATEGORIZED,
    },
  )

  const { code } = generateLinkingCode(alice.id)
  const partnership = createPartnership(bob.id, code)
  const sharedCategory = findSharedCategoryByIdRepository(partnership.id, '1-SCAT')

  return {
    alice,
    bob,
    partnership,
    sharedCategory,
  }
}

describe('createSharedExpense', () => {
  beforeEach(resetDb)

  it('half split creates 2 transactions with half amount each', () => {
    const { bob, sharedCategory } = seedPartneredUsers()

    const sharedExpense = createSharedExpense({
      userId: bob.id,
      sharedCategoryId: sharedCategory.id,
      totalAmountCents: 3000,
      split: 'half',
    })

    expect(sharedExpense.owedAmountCents).toBe(1500)
    expect(db.transactions).toHaveLength(2)
    expect(db.transactions.map((t) => t.amountCents)).toEqual([1500, 1500])
  })

  it('full split creates only one transaction for owed', () => {
    const { bob, sharedCategory } = seedPartneredUsers()

    const sharedExpense = createSharedExpense({
      userId: bob.id,
      sharedCategoryId: sharedCategory.id,
      totalAmountCents: 9999,
      split: 'full',
    })

    expect(sharedExpense.owedAmountCents).toBe(9999)
    expect(db.transactions).toHaveLength(1)
    expect(db.transactions.map((t) => t.amountCents)).toEqual([9999])
  })
})
