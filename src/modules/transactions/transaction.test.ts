import { beforeAll, beforeEach, expect, test } from 'vitest'
import type { Database } from '../../database/db.js'
import { categoriesTable } from '../../database/schemas/category.schema.js'
import { transactionsTable } from '../../database/schemas/transaction.schema.js'
import { usersTable } from '../../database/schemas/user.schema.js'
import { setupDbTest } from '../../tests/setup-db-test.js'
import { TransactionRepository } from './transaction.repository.js'
import { TransactionService } from './transaction.service.js'

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
      email: email,
      passwordHash: 'hashedPassword',
    })
    .returning()

  if (!user) throw new Error('seed: user not created')

  const [category] = await dbTest
    .insert(categoriesTable)
    .values({
      userId: user.id,
      name: 'Eating out',
    })
    .returning()

  if (!category) throw new Error('seed: category not created')

  return { user, category }
}

function sut() {
  const transactionRepository = new TransactionRepository(dbTest)
  const transactionService = new TransactionService(transactionRepository)

  return { transactionService }
}

test('create new transaction for an user', async () => {
  const { transactionService } = sut()
  const { user, category } = await seed()

  const newTransaction = await transactionService.create({
    userId: user.id,
    categoryId: category.id,
    type: 'expense',
    amountInCents: 10000,
    description: 'ifood',
  })

  expect(newTransaction).toStrictEqual({
    id: expect.any(String),
    category: {
      id: category.id,
      name: category.name,
    },
    type: 'expense',
    amountInCents: 10000,
    description: 'ifood',
    createdAt: expect.any(Date),
  })
})

test('find all transactions returns all transactions for a given user only', async () => {
  const { transactionService } = sut()
  const owner = await seed()
  const other = await seed('user2@test.com')

  await transactionService.create({
    userId: owner.user.id,
    categoryId: owner.category.id,
    type: 'expense',
    amountInCents: 99999,
    description: 'mine',
  })

  await transactionService.create({
    userId: other.user.id,
    categoryId: other.category.id,
    type: 'expense',
    amountInCents: 55555,
    description: 'theirs',
  })

  const result = await transactionService.findAll({
    userId: owner.user.id,
  })

  expect(result).toHaveLength(1)
  expect(result[0]?.description).toBe('mine')
})

test('find all transactions returns all transactions for a given user only', async () => {
  const { transactionService } = sut()
  const owner = await seed()
  const other = await seed('user2@test.com')

  await transactionService.create({
    userId: owner.user.id,
    categoryId: owner.category.id,
    type: 'expense',
    amountInCents: 99999,
    description: 'mine',
  })

  await transactionService.create({
    userId: other.user.id,
    categoryId: other.category.id,
    type: 'expense',
    amountInCents: 55555,
    description: 'theirs',
  })

  const result = await transactionService.findAll({
    userId: owner.user.id,
  })

  expect(result).toHaveLength(1)
  expect(result[0]?.description).toBe('mine')
})
