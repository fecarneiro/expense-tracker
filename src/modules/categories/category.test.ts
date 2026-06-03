import { beforeAll, beforeEach, expect, test } from 'vitest'
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
import { CategoryRepository } from './category.repository.js'
import { CategoryService } from './category.service.js'

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
  const categoryRepository = new CategoryRepository(dbTest)
  const categoryService = new CategoryService(categoryRepository)

  return { categoryService }
}

test('create returns the persisted category', async () => {
  const { categoryService } = sut()
  const owner = await seed()

  const created = await categoryService.create({
    userId: owner.user.id,
    name: 'Hobbies',
  })

  expect(created).toStrictEqual({
    id: created.id,
    name: 'Hobbies',
    createdAt: expect.any(Date),
  })
})

test('create fails when the name already exists with different capitalization', async () => {
  const { categoryService } = sut()
  const owner = await seed()

  await categoryService.create({
    userId: owner.user.id,
    name: 'Hobbies',
  })

  await expect(
    categoryService.create({
      userId: owner.user.id,
      name: 'hobbies',
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
  })

  await expect(
    categoryService.create({
      userId: other.user.id,
      name: 'Hobbies',
    }),
  ).resolves.toMatchObject({ name: 'Hobbies' })
})

test('update changes the fields of the owner category', async () => {
  const { categoryService } = sut()
  const owner = await seed()

  const created = await categoryService.create({
    userId: owner.user.id,
    name: 'Hobbies',
  })

  const updated = await categoryService.update({
    id: created.id,
    userId: owner.user.id,
    name: 'Eating Out',
  })

  expect(updated).toStrictEqual({
    id: created.id,
    name: 'Eating Out',
    createdAt: expect.any(Date),
  })
})

test('update fails when the name already exists', async () => {
  const { categoryService } = sut()
  const owner = await seed()

  await categoryService.create({
    userId: owner.user.id,
    name: 'Sports',
  })

  const created = await categoryService.create({
    userId: owner.user.id,
    name: 'Hobbies',
  })

  await expect(
    categoryService.update({
      id: created.id,
      userId: owner.user.id,
      name: 'Sports',
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
  })

  await expect(
    categoryService.update({
      id: created.id,
      userId: other.user.id,
      name: 'Sports',
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
  })

  const result = await categoryService.findById({
    id: created.id,
    userId: owner.user.id,
  })

  expect(result).toStrictEqual({
    id: created.id,
    name: 'Hobbies',
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
  })

  await expect(
    categoryService.findById({
      id: created.id,
      userId: other.user.id,
    }),
  ).rejects.toThrow(new CategoryNotFoundError())
})

test('findAll returns only the categories of the given user', async () => {
  const { categoryService } = sut()
  const owner = await seed()
  const other = await seed('other@test.com')

  await categoryService.create({
    userId: owner.user.id,
    name: 'Hobbies',
  })

  await categoryService.create({
    userId: other.user.id,
    name: 'Hiking',
  })

  const result = await categoryService.findAll({
    userId: owner.user.id,
  })

  expect(result).toHaveLength(1)
  expect(result[0]?.name).toBe('Hobbies')
})

test('delete removes the category of the owner', async () => {
  const { categoryService } = sut()
  const owner = await seed()

  const created = await categoryService.create({
    userId: owner.user.id,
    name: 'Hobbies',
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
  })

  await dbTest.insert(transactionsTable).values({
    userId: owner.user.id,
    categoryId: created.id,
    type: 'expense',
    amountInCents: 99999,
    description: 'mine',
  })

  await expect(
    categoryService.delete({ id: created.id, userId: owner.user.id }),
  ).rejects.toThrow(new CategoryInUseError())
})
