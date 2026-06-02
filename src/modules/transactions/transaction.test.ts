import { beforeAll, beforeEach, expect, test } from 'vitest'
import type { Database } from '../../database/db.js'
import { categoriesTable } from '../../database/schemas/category.schema.js'
import { transactionsTable } from '../../database/schemas/transaction.schema.js'
import { usersTable } from '../../database/schemas/user.schema.js'
import { setupDbTest } from '../../tests/setup-db-test.js'
import { CategoryNotFoundError } from '../categories/category.error.js'
import { TransactionNotFoundError } from './transaction.error.js'
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

test('create returns the persisted transaction with its category', async () => {
  const { transactionService } = sut()
  const owner = await seed()

  const newTransaction = await transactionService.create({
    userId: owner.user.id,
    categoryId: owner.category.id,
    type: 'expense',
    amountInCents: 10000,
    description: 'ifood',
  })

  expect(newTransaction).toStrictEqual({
    id: expect.any(String),
    category: {
      id: owner.category.id,
      name: owner.category.name,
    },
    type: 'expense',
    amountInCents: 10000,
    description: 'ifood',
    createdAt: expect.any(Date),
  })
})

test('create fails when the category does not exist', async () => {
  const { transactionService } = sut()
  const { user } = await seed()

  await expect(
    transactionService.create({
      userId: user.id,
      categoryId: '019e8885-153c-7c82-af4a-28a31559e01e',
      type: 'expense',
      amountInCents: 10000,
      description: 'ifood',
    }),
  ).rejects.toThrow(new CategoryNotFoundError())
})

test('update changes the fields of the owner transaction', async () => {
  const { transactionService } = sut()
  const owner = await seed()

  const created = await transactionService.create({
    userId: owner.user.id,
    categoryId: owner.category.id,
    type: 'expense',
    amountInCents: 99999,
    description: 'mine',
  })

  const updated = await transactionService.update({
    id: created.id,
    userId: owner.user.id,
    categoryId: owner.category.id,
    amountInCents: 22000,
  })

  expect(updated).toStrictEqual({
    id: created.id,
    category: {
      id: owner.category.id,
      name: owner.category.name,
    },
    type: 'expense',
    amountInCents: 22000,
    description: 'mine',
    createdAt: expect.any(Date),
  })
})

test('update fails and preserves data when the user is not the owner', async () => {
  const { transactionService } = sut()
  const owner = await seed()
  const other = await seed('other@test.com')

  const created = await transactionService.create({
    userId: owner.user.id,
    categoryId: owner.category.id,
    type: 'expense',
    amountInCents: 99999,
    description: 'mine',
  })

  await expect(
    transactionService.update({
      id: created.id,
      userId: other.user.id,
      amountInCents: 55555,
      description: 'my transaction',
    }),
  ).rejects.toThrow(new TransactionNotFoundError())

  await expect(
    transactionService.findById({
      id: created.id,
      userId: owner.user.id,
    }),
  ).resolves.toMatchObject({ amountInCents: 99999, description: 'mine' })
})

test('findAll returns only the transactions of the given user', async () => {
  const { transactionService } = sut()
  const owner = await seed()
  const other = await seed('other@test.com')

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

test('findById returns the transaction of the owner', async () => {
  const { transactionService } = sut()
  const owner = await seed()

  const created = await transactionService.create({
    userId: owner.user.id,
    categoryId: owner.category.id,
    type: 'expense',
    amountInCents: 99999,
    description: 'mine',
  })

  const result = await transactionService.findById({
    id: created.id,
    userId: owner.user.id,
  })

  expect(result).toStrictEqual({
    id: created.id,
    category: {
      id: owner.category.id,
      name: owner.category.name,
    },
    type: 'expense',
    amountInCents: 99999,
    description: 'mine',
    createdAt: expect.any(Date),
  })
})

test('findById fails when the user is not the owner', async () => {
  const { transactionService } = sut()
  const owner = await seed()
  const other = await seed('other@test.com')

  const created = await transactionService.create({
    userId: owner.user.id,
    categoryId: owner.category.id,
    type: 'expense',
    amountInCents: 99999,
    description: 'mine',
  })

  await expect(
    transactionService.findById({
      id: created.id,
      userId: other.user.id,
    }),
  ).rejects.toThrow(new TransactionNotFoundError())
})

test('delete removes the transaction of the owner', async () => {
  const { transactionService } = sut()
  const owner = await seed()

  const created = await transactionService.create({
    userId: owner.user.id,
    categoryId: owner.category.id,
    type: 'expense',
    amountInCents: 99999,
    description: 'mine',
  })

  await expect(
    transactionService.delete({
      id: created.id,
      userId: owner.user.id,
    }),
  ).resolves.toBeUndefined()

  await expect(
    transactionService.findById({
      id: created.id,
      userId: owner.user.id,
    }),
  ).rejects.toThrow(new TransactionNotFoundError())
})

test('delete fails and preserves data when the user is not the owner', async () => {
  const { transactionService } = sut()
  const owner = await seed()
  const other = await seed('other@test.com')

  const created = await transactionService.create({
    userId: owner.user.id,
    categoryId: owner.category.id,
    type: 'expense',
    amountInCents: 99999,
    description: 'mine',
  })

  await expect(
    transactionService.delete({
      id: created.id,
      userId: other.user.id,
    }),
  ).rejects.toThrow(new TransactionNotFoundError())

  await expect(
    transactionService.findById({
      id: created.id,
      userId: owner.user.id,
    }),
  ).resolves.toMatchObject({ id: created.id })
})
