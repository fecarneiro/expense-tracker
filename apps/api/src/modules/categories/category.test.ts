import { describe } from 'vitest'
import { transactionsTable } from '../../database/schemas/transactions.schema.js'
import { TEST_OCCURRED_AT_DATE } from '../../tests/constants.js'
import { insertOtherTestUser, insertTestUser } from '../../tests/factories/user.factory.js'
import { expect, integrationTest as test } from '../../tests/fixtures/integration.fixture.js'
import { CATEGORY_SYSTEM_KEY, defaultCategories } from './category.defaults.js'
import {
  CategoryAlreadyExistsError,
  CategoryInUseError,
  CategoryNotFoundError,
  CategorySystemProtectedError,
} from './category.error.js'

describe('CategoryService', () => {
  test('create returns the public category', async ({ container, db }) => {
    const owner = await insertTestUser(db)

    const created = await container.categoryService.create({
      userId: owner.id,
      name: 'Hobbies',
      categoryType: 'expense',
    })

    expect(created).toStrictEqual({
      id: created.id,
      name: 'Hobbies',
      categoryType: 'expense',
    })
  })

  test('create fails when the name already exists with different capitalization', async ({
    container,
    db,
  }) => {
    const owner = await insertTestUser(db)

    await container.categoryService.create({
      userId: owner.id,
      name: 'Salary',
      categoryType: 'income',
    })

    await expect(
      container.categoryService.create({
        userId: owner.id,
        name: 'Salary',
        categoryType: 'income',
      }),
    ).rejects.toThrow(CategoryAlreadyExistsError)
  })

  test('create allows the same name for different users', async ({ container, db }) => {
    const owner = await insertTestUser(db)
    const other = await insertOtherTestUser(db)

    await container.categoryService.create({
      userId: owner.id,
      name: 'Hobbies',
      categoryType: 'expense',
    })

    await expect(
      container.categoryService.create({
        userId: other.id,
        name: 'Hobbies',
        categoryType: 'expense',
      }),
    ).resolves.toMatchObject({ name: 'Hobbies' })
  })

  test('createDefaultsForUser creates default categories for a user', async ({ container, db }) => {
    const owner = await insertTestUser(db)

    const categories = await container.categoryService.createDefaultsForUser(owner.id)
    expect(categories.length).toBe(defaultCategories.length)

    const uncategorized = await container.categoryService.findBySystemKey({
      userId: owner.id,
      systemKey: CATEGORY_SYSTEM_KEY.UNCATEGORIZED,
    })
    expect(uncategorized).toMatchObject({
      userId: owner.id,
      name: 'Uncategorized',
      categoryType: 'expense',
    })
    expect(uncategorized).not.toHaveProperty('systemKey')
  })

  test('createDefaultsForUser fails when the default categories already exist', async ({
    container,
    db,
  }) => {
    const owner = await insertTestUser(db)

    await container.categoryService.createDefaultsForUser(owner.id)
    await expect(container.categoryService.createDefaultsForUser(owner.id)).rejects.toThrow(
      new CategoryAlreadyExistsError(),
    )
  })

  test('update fails for the uncategorized system category', async ({ container, db }) => {
    const owner = await insertTestUser(db)
    await container.categoryService.createDefaultsForUser(owner.id)

    const uncategorized = await container.categoryService.findBySystemKey({
      userId: owner.id,
      systemKey: CATEGORY_SYSTEM_KEY.UNCATEGORIZED,
    })

    await expect(
      container.categoryService.update({
        id: uncategorized.id,
        userId: owner.id,
        name: 'Renamed',
        categoryType: 'expense',
      }),
    ).rejects.toThrow(CategorySystemProtectedError)
  })

  test('delete fails for the uncategorized system category', async ({ container, db }) => {
    const owner = await insertTestUser(db)
    await container.categoryService.createDefaultsForUser(owner.id)

    const uncategorized = await container.categoryService.findBySystemKey({
      userId: owner.id,
      systemKey: CATEGORY_SYSTEM_KEY.UNCATEGORIZED,
    })

    await expect(
      container.categoryService.delete({
        id: uncategorized.id,
        userId: owner.id,
      }),
    ).rejects.toThrow(CategorySystemProtectedError)
  })

  test('findBySystemKey fails when the system category does not exist', async ({
    container,
    db,
  }) => {
    const owner = await insertTestUser(db)

    await expect(
      container.categoryService.findBySystemKey({
        userId: owner.id,
        systemKey: CATEGORY_SYSTEM_KEY.UNCATEGORIZED,
      }),
    ).rejects.toThrow(CategoryNotFoundError)
  })

  test('update changes the fields of the owner category', async ({ container, db }) => {
    const owner = await insertTestUser(db)

    const created = await container.categoryService.create({
      userId: owner.id,
      name: 'Hobbies',
      categoryType: 'income',
    })

    const updated = await container.categoryService.update({
      id: created.id,
      userId: owner.id,
      name: 'Eating Out',
      categoryType: 'expense',
    })

    expect(updated).toStrictEqual({
      id: created.id,
      name: 'Eating Out',
      categoryType: 'expense',
    })
  })

  test('update allows keeping the same name', async ({ container, db }) => {
    const owner = await insertTestUser(db)

    const created = await container.categoryService.create({
      userId: owner.id,
      name: 'Hobbies',
      categoryType: 'expense',
    })

    const updated = await container.categoryService.update({
      id: created.id,
      userId: owner.id,
      name: 'Hobbies',
      categoryType: 'expense',
    })

    expect(updated).toStrictEqual({
      id: created.id,
      name: 'Hobbies',
      categoryType: 'expense',
    })
  })

  test('update fails when the name already exists', async ({ container, db }) => {
    const owner = await insertTestUser(db)

    await container.categoryService.create({
      userId: owner.id,
      name: 'Sports',
      categoryType: 'expense',
    })

    const created = await container.categoryService.create({
      userId: owner.id,
      name: 'Hobbies',
      categoryType: 'expense',
    })

    await expect(
      container.categoryService.update({
        id: created.id,
        userId: owner.id,
        name: 'Sports',
        categoryType: 'expense',
      }),
    ).rejects.toThrow(CategoryAlreadyExistsError)
  })

  test('update fails when the name already exists with different capitalization', async ({
    container,
    db,
  }) => {
    const owner = await insertTestUser(db)

    await container.categoryService.create({
      userId: owner.id,
      name: 'Sports',
      categoryType: 'expense',
    })

    const created = await container.categoryService.create({
      userId: owner.id,
      name: 'Hobbies',
      categoryType: 'expense',
    })

    await expect(
      container.categoryService.update({
        id: created.id,
        userId: owner.id,
        name: 'sports',
        categoryType: 'expense',
      }),
    ).rejects.toThrow(CategoryAlreadyExistsError)
  })

  test('update fails and preserves data when the user is not the owner', async ({
    container,
    db,
  }) => {
    const owner = await insertTestUser(db)
    const other = await insertOtherTestUser(db)

    const created = await container.categoryService.create({
      userId: owner.id,
      name: 'Hobbies',
      categoryType: 'expense',
    })

    await expect(
      container.categoryService.update({
        id: created.id,
        userId: other.id,
        name: 'Sports',
        categoryType: 'expense',
      }),
    ).rejects.toThrow(CategoryNotFoundError)

    await expect(
      container.categoryService.findById({
        id: created.id,
        userId: owner.id,
      }),
    ).resolves.toMatchObject({ name: 'Hobbies' })
  })

  test('findById returns the category of the owner', async ({ container, db }) => {
    const owner = await insertTestUser(db)

    const created = await container.categoryService.create({
      userId: owner.id,
      name: 'Hobbies',
      categoryType: 'expense',
    })

    const result = await container.categoryService.findById({
      id: created.id,
      userId: owner.id,
    })

    expect(result).toStrictEqual({
      id: created.id,
      name: 'Hobbies',
      categoryType: 'expense',
    })
  })

  test('findById fails when the user is not the owner', async ({ container, db }) => {
    const owner = await insertTestUser(db)
    const other = await insertOtherTestUser(db)

    const created = await container.categoryService.create({
      userId: owner.id,
      name: 'Hobbies',
      categoryType: 'expense',
    })

    await expect(
      container.categoryService.findById({
        id: created.id,
        userId: other.id,
      }),
    ).rejects.toThrow(CategoryNotFoundError)
  })

  test('findByType returns the category specified by type of the owner', async ({
    container,
    db,
  }) => {
    const owner = await insertTestUser(db)

    await container.categoryService.create({
      userId: owner.id,
      name: 'Hobbies',
      categoryType: 'expense',
    })

    await container.categoryService.create({
      userId: owner.id,
      name: 'Sports',
      categoryType: 'expense',
    })

    await container.categoryService.create({
      userId: owner.id,
      name: 'Salary',
      categoryType: 'income',
    })

    const categories = await container.categoryService.findByType({
      categoryType: 'expense',
      userId: owner.id,
    })

    expect(categories.length).toBe(2)
    expect(categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Hobbies', categoryType: 'expense' }),
        expect.objectContaining({ name: 'Sports', categoryType: 'expense' }),
      ]),
    )
  })

  test('findByType only returns categories of the given user', async ({ container, db }) => {
    const owner = await insertTestUser(db)
    const other = await insertOtherTestUser(db)

    await container.categoryService.create({
      userId: owner.id,
      name: 'Hobbies',
      categoryType: 'expense',
    })

    await expect(
      container.categoryService.findByType({ categoryType: 'expense', userId: owner.id }),
    ).resolves.toStrictEqual([
      {
        id: expect.any(String),
        name: 'Hobbies',
        categoryType: 'expense',
      },
    ])

    await expect(
      container.categoryService.findByType({ categoryType: 'expense', userId: other.id }),
    ).resolves.toStrictEqual([])
  })

  test('findByName returns the category of the owner ignoring capitalization', async ({
    container,
    db,
  }) => {
    const owner = await insertTestUser(db)

    const created = await container.categoryService.create({
      userId: owner.id,
      name: 'Hobbies',
      categoryType: 'expense',
    })

    const result = await container.categoryService.findByNameAndType({
      name: 'hobbies',
      userId: owner.id,
      categoryType: 'expense',
    })

    expect(result).toStrictEqual({
      id: created.id,
      userId: owner.id,
      name: 'Hobbies',
      categoryType: 'expense',
      createdAt: expect.any(Date),
    })
  })

  test('findByName returns null when the category does not exist', async ({ container, db }) => {
    const owner = await insertTestUser(db)

    const result = await container.categoryService.findByNameAndType({
      name: 'Nonexistent',
      userId: owner.id,
      categoryType: 'expense',
    })

    expect(result).toBeNull()
  })

  test('findByName does not return categories from another user', async ({ container, db }) => {
    const owner = await insertTestUser(db)
    const other = await insertTestUser(db, { email: 'other@domain.com' })

    await container.categoryService.create({
      userId: other.id,
      name: 'Hobbies',
      categoryType: 'expense',
    })

    const result = await container.categoryService.findByNameAndType({
      name: 'Hobbies',
      categoryType: 'expense',
      userId: owner.id,
    })

    expect(result).toBeNull()
  })

  test('findAll returns an empty list when the user has no categories', async ({
    container,
    db,
  }) => {
    const owner = await insertTestUser(db)

    const result = await container.categoryService.findAll({
      userId: owner.id,
    })

    expect(result).toStrictEqual([])
  })

  test('findAll returns only the categories of the given user', async ({ container, db }) => {
    const owner = await insertTestUser(db)
    const other = await insertOtherTestUser(db)

    await container.categoryService.create({
      userId: owner.id,
      name: 'Hobbies',
      categoryType: 'expense',
    })

    await container.categoryService.create({
      userId: other.id,
      name: 'Hiking',
      categoryType: 'expense',
    })

    const result = await container.categoryService.findAll({
      userId: owner.id,
    })

    expect(result).toStrictEqual([
      {
        id: expect.any(String),
        name: 'Hobbies',
        categoryType: 'expense',
      },
    ])
  })

  test('delete removes the category of the owner', async ({ container, db }) => {
    const owner = await insertTestUser(db)

    const created = await container.categoryService.create({
      userId: owner.id,
      name: 'Hobbies',
      categoryType: 'expense',
    })

    await expect(
      container.categoryService.delete({
        id: created.id,
        userId: owner.id,
      }),
    ).resolves.toBeUndefined()

    await expect(
      container.categoryService.findById({
        id: created.id,
        userId: owner.id,
      }),
    ).rejects.toThrow(CategoryNotFoundError)
  })

  test('delete fails and preserves data when the user is not the owner', async ({
    container,
    db,
  }) => {
    const owner = await insertTestUser(db)
    const other = await insertOtherTestUser(db)

    const created = await container.categoryService.create({
      userId: owner.id,
      name: 'Hobbies',
      categoryType: 'expense',
    })

    await expect(
      container.categoryService.delete({
        id: created.id,
        userId: other.id,
      }),
    ).rejects.toThrow(CategoryNotFoundError)

    await expect(
      container.categoryService.findById({
        id: created.id,
        userId: owner.id,
      }),
    ).resolves.toMatchObject({ id: created.id })
  })

  test('delete fails when the category is in use by a transaction', async ({ container, db }) => {
    const owner = await insertTestUser(db)

    const created = await container.categoryService.create({
      userId: owner.id,
      name: 'Hobbies',
      categoryType: 'expense',
    })

    await db.insert(transactionsTable).values({
      userId: owner.id,
      createdByUserId: owner.id,
      categoryId: created.id,
      transactionType: 'expense',
      occurredAt: TEST_OCCURRED_AT_DATE,
      amountCents: 99999,
      description: 'mine',
    })

    await expect(
      container.categoryService.delete({ id: created.id, userId: owner.id }),
    ).rejects.toThrow(new CategoryInUseError())
  })

  test('create persists and returns the categoryType', async ({ container, db }) => {
    const owner = await insertTestUser(db)

    const income = await container.categoryService.create({
      userId: owner.id,
      name: 'Salary',
      categoryType: 'income',
    })

    const expense = await container.categoryService.create({
      userId: owner.id,
      name: 'Groceries',
      categoryType: 'expense',
    })

    expect(income.categoryType).toBe('income')
    expect(expense.categoryType).toBe('expense')
  })

  test('update can change the categoryType', async ({ container, db }) => {
    const owner = await insertTestUser(db)

    const created = await container.categoryService.create({
      userId: owner.id,
      name: 'Variable',
      categoryType: 'expense',
    })

    const updated = await container.categoryService.update({
      id: created.id,
      userId: owner.id,
      name: 'Variable',
      categoryType: 'income',
    })

    expect(updated.categoryType).toBe('income')
  })

  test('findAll returns categoryType for each category', async ({ container, db }) => {
    const owner = await insertTestUser(db)

    await container.categoryService.create({
      userId: owner.id,
      name: 'Salary',
      categoryType: 'income',
    })
    await container.categoryService.create({
      userId: owner.id,
      name: 'Food',
      categoryType: 'expense',
    })

    const all = await container.categoryService.findAll({ userId: owner.id })

    expect(all).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Salary', categoryType: 'income' }),
        expect.objectContaining({ name: 'Food', categoryType: 'expense' }),
      ]),
    )
  })
})
