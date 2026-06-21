import { beforeAll, beforeEach, expect, test } from 'vitest'
import { createContainer } from '../../container.js'
import type { Database } from '../../database/db.js'
import { categoriesTable } from '../../database/schemas/category.schema.js'
import { transactionsTable } from '../../database/schemas/transaction.schema.js'
import { usersTable } from '../../database/schemas/user.schema.js'
import { setupDbTest } from '../../tests/setup-db-test.js'

let dbTest: Database

beforeAll(async () => {
  const setup = await setupDbTest()
  dbTest = setup.dbTest as unknown as Database

  return async () => {
    setup.client.close()
  }
})

beforeEach(async () => {
  await dbTest.delete(transactionsTable)
  await dbTest.delete(categoriesTable)
  await dbTest.delete(usersTable)
})

async function seed(email = 'user@test.com') {
  const [user] = await dbTest
    .insert(usersTable)
    .values({
      email,
      passwordHash: 'hashedPassword',
    })
    .returning()

  if (!user) throw new Error('seed: user not created')

  const [category] = await dbTest
    .insert(categoriesTable)
    .values({
      userId: user.id,
      name: 'Food',
      categoryType: 'expense',
    })
    .returning()

  if (!category) throw new Error('seed: category not created')

  return { user, category }
}

function sut() {
  return createContainer(dbTest)
}

test('monthlyBalance returns balance as incomeTotal minus expenseTotal', async () => {
  const { analyticsService } = sut()
  const { user, category } = await seed()

  await dbTest.insert(transactionsTable).values({
    userId: user.id,
    categoryId: category.id,
    occurredOn: '2026-01-15',
    transactionType: 'income',
    amountInCents: 100000,
  })
  await dbTest.insert(transactionsTable).values({
    userId: user.id,
    categoryId: category.id,
    occurredOn: '2026-01-20',
    transactionType: 'expense',
    amountInCents: 30000,
  })

  const result = await analyticsService.monthlyBalance({
    userId: user.id,
    startMonth: '2026-01',
    endMonth: '2026-01',
  })

  expect(result).toStrictEqual([
    {
      month: '2026-01',
      incomeTotal: 100000,
      expenseTotal: 30000,
      balance: 70000,
    },
  ])
})

test('monthlyBalance returns only the authenticated user data', async () => {
  const { analyticsService } = sut()
  const owner = await seed('owner@test.com')
  const other = await seed('other@test.com')

  await dbTest.insert(transactionsTable).values({
    userId: owner.user.id,
    categoryId: owner.category.id,
    occurredOn: '2026-02-10',
    transactionType: 'expense',
    amountInCents: 5000,
  })
  await dbTest.insert(transactionsTable).values({
    userId: other.user.id,
    categoryId: other.category.id,
    occurredOn: '2026-02-10',
    transactionType: 'income',
    amountInCents: 99000,
  })

  const result = await analyticsService.monthlyBalance({
    userId: owner.user.id,
    startMonth: '2026-02',
    endMonth: '2026-02',
  })

  expect(result).toStrictEqual([
    {
      month: '2026-02',
      incomeTotal: 0,
      expenseTotal: 5000,
      balance: -5000,
    },
  ])
})
