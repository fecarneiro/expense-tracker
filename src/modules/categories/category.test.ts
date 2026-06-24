import { beforeAll, beforeEach, expect, test } from 'vitest'
import { createContainer } from '../../container.js'
import type { Database } from '../../database/db.js'
import { categoriesTable } from '../../database/schemas/category.schema.js'
import { transactionsTable } from '../../database/schemas/transaction.schema.js'
import { usersTable } from '../../database/schemas/user.schema.js'
import { setupDbTest } from '../../tests/setup-db-test.js'
import {
  CategoryAlreadyExistsError,
  CategoryInUseError,
  CategoryNotFoundError,
} from './category.error.js'

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

  return { user }
}

function sut() {
  return createContainer(dbTest)
}

test('create returns the persisted category', async () => {
  const { categoryService } = sut()
  const owner = await seed()

  const created = await categoryService.create({
    userId: owner.user.id,
    name: 'Hobbies',
    categoryType: 'expense',
  })

  expect(created).toStrictEqual({
    id: created.id,
    userId: owner.user.id,
    name: 'Hobbies',
    categoryType: 'expense',
    createdAt: expect.any(Date),
  })
})

test('create fails when the name already exists with different capitalization', async () => {
  const { categoryService } = sut()
  const owner = await seed()

  await categoryService.create({
    userId: owner.user.id,
    name: 'Salary',
    categoryType: 'income',
  })

  await expect(
    categoryService.create({
      userId: owner.user.id,
      name: 'Salary',
      categoryType: 'income',
    }),
  ).rejects.toThrow(new CategoryAlreadyExistsError())
})

test('create allows the same name for different users', async () => {
  const { categoryService } = sut()
  const owner = await seed()
  const other = await seed('other@test.com')

  await categoryService.create({
    userId: owner.user.id,
    name: 'Hobbies',
    categoryType: 'expense',
  })

  await expect(
    categoryService.create({
      userId: other.user.id,
      name: 'Hobbies',
      categoryType: 'expense',
    }),
  ).resolves.toMatchObject({ name: 'Hobbies' })
})

test('update changes the fields of the owner category', async () => {
  const { categoryService } = sut()
  const owner = await seed()

  const created = await categoryService.create({
    userId: owner.user.id,
    name: 'Hobbies',
    categoryType: 'income',
  })

  const updated = await categoryService.update({
    id: created.id,
    userId: owner.user.id,
    name: 'Eating Out',
    categoryType: 'expense',
  })

  expect(updated).toStrictEqual({
    id: created.id,
    name: 'Eating Out',
    userId: owner.user.id,
    categoryType: 'expense',
    createdAt: expect.any(Date),
  })
})

test('update allows keeping the same name', async () => {
  const { categoryService } = sut()
  const owner = await seed()

  const created = await categoryService.create({
    userId: owner.user.id,
    name: 'Hobbies',
    categoryType: 'expense',
  })

  const updated = await categoryService.update({
    id: created.id,
    userId: owner.user.id,
    name: 'Hobbies',
    categoryType: 'expense',
  })

  expect(updated).toStrictEqual({
    id: created.id,
    name: 'Hobbies',
    userId: owner.user.id,
    categoryType: 'expense',
    createdAt: expect.any(Date),
  })
})

test('update fails when the name already exists', async () => {
  const { categoryService } = sut()
  const owner = await seed()

  await categoryService.create({
    userId: owner.user.id,
    name: 'Sports',
    categoryType: 'expense',
  })

  const created = await categoryService.create({
    userId: owner.user.id,
    name: 'Hobbies',
    categoryType: 'expense',
  })

  await expect(
    categoryService.update({
      id: created.id,
      userId: owner.user.id,
      name: 'Sports',
      categoryType: 'expense',
    }),
  ).rejects.toThrow(new CategoryAlreadyExistsError())
})

test('update fails when the name already exists with different capitalization', async () => {
  const { categoryService } = sut()
  const owner = await seed()

  await categoryService.create({
    userId: owner.user.id,
    name: 'Sports',
    categoryType: 'expense',
  })

  const created = await categoryService.create({
    userId: owner.user.id,
    name: 'Hobbies',
    categoryType: 'expense',
  })

  await expect(
    categoryService.update({
      id: created.id,
      userId: owner.user.id,
      name: 'sports',
      categoryType: 'expense',
    }),
  ).rejects.toThrow(new CategoryAlreadyExistsError())
})

test('update fails and preserves data when the user is not the owner', async () => {
  const { categoryService } = sut()
  const owner = await seed()
  const other = await seed('other@test.com')

  const created = await categoryService.create({
    userId: owner.user.id,
    name: 'Hobbies',
    categoryType: 'expense',
  })

  await expect(
    categoryService.update({
      id: created.id,
      userId: other.user.id,
      name: 'Sports',
      categoryType: 'expense',
    }),
  ).rejects.toThrow(new CategoryNotFoundError())

  await expect(
    categoryService.findById({
      id: created.id,
      userId: owner.user.id,
    }),
  ).resolves.toMatchObject({ name: 'Hobbies' })
})

test('findById returns the category of the owner', async () => {
  const { categoryService } = sut()
  const owner = await seed()

  const created = await categoryService.create({
    userId: owner.user.id,
    name: 'Hobbies',
    categoryType: 'expense',
  })

  const result = await categoryService.findById({
    id: created.id,
    userId: owner.user.id,
  })

  expect(result).toStrictEqual({
    id: created.id,
    userId: owner.user.id,
    name: 'Hobbies',
    categoryType: 'expense',
    createdAt: expect.any(Date),
  })
})

test('findById fails when the user is not the owner', async () => {
  const { categoryService } = sut()
  const owner = await seed()
  const other = await seed('other@test.com')

  const created = await categoryService.create({
    userId: owner.user.id,
    name: 'Hobbies',
    categoryType: 'expense',
  })

  await expect(
    categoryService.findById({
      id: created.id,
      userId: other.user.id,
    }),
  ).rejects.toThrow(new CategoryNotFoundError())
})

test('findByType returns the category specified by type of the owner', async () => {
  const { categoryService } = sut()
  const owner = await seed()

  await categoryService.create({
    userId: owner.user.id,
    name: 'Hobbies',
    categoryType: 'expense',
  })

  await categoryService.create({
    userId: owner.user.id,
    name: 'Sports',
    categoryType: 'expense',
  })

  await categoryService.create({
    userId: owner.user.id,
    name: 'Salary',
    categoryType: 'income',
  })

  const categories = await categoryService.findByType({
    categoryType: 'expense',
    userId: owner.user.id,
  })

  expect(categories.length).toBe(2)
  expect(categories).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ name: 'Hobbies', categoryType: 'expense' }),
      expect.objectContaining({ name: 'Sports', categoryType: 'expense' }),
    ]),
  )
})

test('findByType only returns categories of the given user', async () => {
  const { categoryService } = sut()
  const owner = await seed()
  const other = await seed('other@test.com')

  await categoryService.create({
    userId: owner.user.id,
    name: 'Hobbies',
    categoryType: 'expense',
  })

  await expect(
    categoryService.findByType({ categoryType: 'expense', userId: owner.user.id }),
  ).resolves.toStrictEqual([
    {
      id: expect.any(String),
      userId: owner.user.id,
      name: 'Hobbies',
      categoryType: 'expense',
      createdAt: expect.any(Date),
    },
  ])

  await expect(
    categoryService.findByType({ categoryType: 'expense', userId: other.user.id }),
  ).resolves.toStrictEqual([])
})

test('findByName returns the category of the owner ignoring capitalization', async () => {
  const { categoryService } = sut()
  const owner = await seed()

  const created = await categoryService.create({
    userId: owner.user.id,
    name: 'Hobbies',
    categoryType: 'expense',
  })

  const result = await categoryService.findByNameAndType({
    name: 'hobbies',
    userId: owner.user.id,
    categoryType: 'expense',
  })

  expect(result).toStrictEqual({
    id: created.id,
    userId: owner.user.id,
    name: 'Hobbies',
    categoryType: 'expense',
    createdAt: expect.any(Date),
  })
})

test('findByName returns null when the category does not exist', async () => {
  const { categoryService } = sut()
  const owner = await seed()

  const result = await categoryService.findByNameAndType({
    name: 'Nonexistent',
    userId: owner.user.id,
    categoryType: 'expense',
  })

  expect(result).toBeNull()
})

test('findByName does not return categories from another user', async () => {
  const { categoryService } = sut()
  const owner = await seed()
  const other = await seed('other@domain.com')

  await categoryService.create({
    userId: other.user.id,
    name: 'Hobbies',
    categoryType: 'expense',
  })

  const result = await categoryService.findByNameAndType({
    name: 'Hobbies',
    categoryType: 'expense',
    userId: owner.user.id,
  })

  expect(result).toBeNull()
})

test('findAll returns an empty list when the user has no categories', async () => {
  const { categoryService } = sut()
  const owner = await seed()

  const result = await categoryService.findAll({
    userId: owner.user.id,
  })

  expect(result).toStrictEqual([])
})

test('findAll returns only the categories of the given user', async () => {
  const { categoryService } = sut()
  const owner = await seed()
  const other = await seed('other@test.com')

  await categoryService.create({
    userId: owner.user.id,
    name: 'Hobbies',
    categoryType: 'expense',
  })

  await categoryService.create({
    userId: other.user.id,
    name: 'Hiking',
    categoryType: 'expense',
  })

  const result = await categoryService.findAll({
    userId: owner.user.id,
  })

  expect(result).toStrictEqual([
    {
      id: expect.any(String),
      userId: owner.user.id,
      name: 'Hobbies',
      categoryType: 'expense',
      createdAt: expect.any(Date),
    },
  ])
})

test('delete removes the category of the owner', async () => {
  const { categoryService } = sut()
  const owner = await seed()

  const created = await categoryService.create({
    userId: owner.user.id,
    name: 'Hobbies',
    categoryType: 'expense',
  })

  await expect(
    categoryService.delete({
      id: created.id,
      userId: owner.user.id,
    }),
  ).resolves.toBeUndefined()

  await expect(
    categoryService.findById({
      id: created.id,
      userId: owner.user.id,
    }),
  ).rejects.toThrow(new CategoryNotFoundError())
})

test('delete fails and preserves data when the user is not the owner', async () => {
  const { categoryService } = sut()
  const owner = await seed()
  const other = await seed('other@test.com')

  const created = await categoryService.create({
    userId: owner.user.id,
    name: 'Hobbies',
    categoryType: 'expense',
  })

  await expect(
    categoryService.delete({
      id: created.id,
      userId: other.user.id,
    }),
  ).rejects.toThrow(new CategoryNotFoundError())

  await expect(
    categoryService.findById({
      id: created.id,
      userId: owner.user.id,
    }),
  ).resolves.toMatchObject({ id: created.id })
})

test('delete fails when the category is in use by a transaction', async () => {
  const { categoryService } = sut()
  const owner = await seed()

  const created = await categoryService.create({
    userId: owner.user.id,
    name: 'Hobbies',
    categoryType: 'expense',
  })

  await dbTest.insert(transactionsTable).values({
    userId: owner.user.id,
    categoryId: created.id,
    transactionType: 'expense',
    occurredOn: '2026-06-03',
    amountInCents: 99999,
    notes: 'mine',
  })

  await expect(categoryService.delete({ id: created.id, userId: owner.user.id })).rejects.toThrow(
    new CategoryInUseError(),
  )
})

test('create persists and returns the categoryType', async () => {
  const { categoryService } = sut()
  const owner = await seed()

  const income = await categoryService.create({
    userId: owner.user.id,
    name: 'Salary',
    categoryType: 'income',
  })

  const expense = await categoryService.create({
    userId: owner.user.id,
    name: 'Groceries',
    categoryType: 'expense',
  })

  expect(income.categoryType).toBe('income')
  expect(expense.categoryType).toBe('expense')
})

test('update can change the categoryType', async () => {
  const { categoryService } = sut()
  const owner = await seed()

  const created = await categoryService.create({
    userId: owner.user.id,
    name: 'Variable',
    categoryType: 'expense',
  })

  const updated = await categoryService.update({
    id: created.id,
    userId: owner.user.id,
    name: 'Variable',
    categoryType: 'income',
  })

  expect(updated.categoryType).toBe('income')
})

test('findAll returns categoryType for each category', async () => {
  const { categoryService } = sut()
  const owner = await seed()

  await categoryService.create({ userId: owner.user.id, name: 'Salary', categoryType: 'income' })
  await categoryService.create({ userId: owner.user.id, name: 'Food', categoryType: 'expense' })

  const all = await categoryService.findAll({ userId: owner.user.id })

  expect(all).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ name: 'Salary', categoryType: 'income' }),
      expect.objectContaining({ name: 'Food', categoryType: 'expense' }),
    ]),
  )
})
