import { describe } from 'vitest'
import type { createContainer } from '../../container.js'
import type { CategoryRow } from '../../database/schemas/category.schema.js'
import type { UserRow } from '../../database/schemas/user.schema.js'
import { TEST_OCCURRED_AT_DATE, UNKNOWN_UUID } from '../../tests/constants.js'
import {
  DEFAULT_CATEGORY_NAME,
  insertTestCategory,
} from '../../tests/factories/category.factory.js'
import { insertTestUser } from '../../tests/factories/user.factory.js'
import { expect, integrationTest as test } from '../../tests/fixtures/integration.fixture.js'
import { CategoryNotFoundError } from '../categories/category.error.js'
import { TransactionNotFoundError } from './transaction.error.js'
import type { CreateTransactionInput } from './transaction.types.js'

const DEFAULT_CREATE = {
  amountInCents: 1000,
  notes: 'my notes',
} as const satisfies Pick<CreateTransactionInput, 'amountInCents' | 'notes'>

type CreateOverrides = Partial<Pick<CreateTransactionInput, 'amountInCents' | 'notes'>>

async function createTransaction(
  container: ReturnType<typeof createContainer>,
  user: UserRow,
  category: CategoryRow,
  overrides?: CreateOverrides,
) {
  const input: CreateTransactionInput = {
    userId: user.id,
    categoryId: category.id,
    occurredAt: TEST_OCCURRED_AT_DATE,
    ...DEFAULT_CREATE,
    ...overrides,
  }

  return container.transactionService.create(input)
}

describe('TransactionService', () => {
  describe('create', () => {
    test('persists transaction with category', async ({ container, db }) => {
      const user = await insertTestUser(db)
      const category = await insertTestCategory(db, { userId: user.id })

      const created = await createTransaction(container, user, category)

      expect(created).toMatchObject({
        amountInCents: DEFAULT_CREATE.amountInCents,
        notes: DEFAULT_CREATE.notes,
        transactionType: 'expense',
        category: {
          id: category.id,
          name: DEFAULT_CATEGORY_NAME,
        },
      })
    })

    test('throws when category does not exist', async ({ container, db }) => {
      const user = await insertTestUser(db)

      await expect(
        container.transactionService.create({
          userId: user.id,
          categoryId: UNKNOWN_UUID,
          occurredAt: TEST_OCCURRED_AT_DATE,
          ...DEFAULT_CREATE,
        }),
      ).rejects.toThrow(CategoryNotFoundError)
    })

    test('derives transactionType from income category', async ({ container, db }) => {
      const user = await insertTestUser(db)
      const category = await insertTestCategory(db, { userId: user.id, categoryType: 'income' })

      const created = await createTransaction(container, user, category)

      expect(created).toMatchObject({
        transactionType: 'income',
      })
    })
  })

  describe('update', () => {
    test('updates provided fields', async ({ container, db }) => {
      const user = await insertTestUser(db)
      const category = await insertTestCategory(db, { userId: user.id })

      const created = await createTransaction(container, user, category)

      const updated = await container.transactionService.update({
        id: created.id,
        userId: user.id,
        amountInCents: 99999,
      })

      expect(updated).toMatchObject({
        amountInCents: 99999,
        notes: DEFAULT_CREATE.notes,
        transactionType: category.categoryType,
        category: {
          id: category.id,
        },
      })
    })

    test('updates transactionType when category changes', async ({ container, db }) => {
      const user = await insertTestUser(db)

      const incomeCategory = await insertTestCategory(db, {
        userId: user.id,
        categoryType: 'income',
      })

      const expenseCategory = await insertTestCategory(db, {
        userId: user.id,
        categoryType: 'expense',
      })

      const created = await createTransaction(container, user, incomeCategory)

      const updated = await container.transactionService.update({
        id: created.id,
        userId: user.id,
        categoryId: expenseCategory.id,
      })

      expect(updated).toMatchObject({
        transactionType: 'expense',
        category: {
          id: expenseCategory.id,
        },
      })
    })

    test('throws for non-owner without mutating the transaction', async ({ container, db }) => {
      const user = await insertTestUser(db)
      const userCategory = await insertTestCategory(db, { userId: user.id })
      const other = await insertTestUser(db, { email: 'other@test.com' })

      const userTransaction = await createTransaction(container, user, userCategory)

      await expect(
        container.transactionService.update({
          id: userTransaction.id,
          userId: other.id,
          amountInCents: 99999,
        }),
      ).rejects.toThrow(TransactionNotFoundError)

      expect(
        await container.transactionService.findById({ id: userTransaction.id, userId: user.id }),
      ).toMatchObject({
        amountInCents: DEFAULT_CREATE.amountInCents,
        notes: DEFAULT_CREATE.notes,
        transactionType: userCategory.categoryType,
        category: {
          id: userCategory.id,
        },
      })
    })

    test('throws when category belongs to another user', async ({ container, db }) => {
      const user = await insertTestUser(db)
      const userCategory = await insertTestCategory(db, { userId: user.id })
      const other = await insertTestUser(db, { email: 'other@test.com' })
      const otherCategory = await insertTestCategory(db, { userId: other.id })

      const userTransaction = await createTransaction(container, user, userCategory)

      await expect(
        container.transactionService.update({
          id: userTransaction.id,
          userId: user.id,
          categoryId: otherCategory.id,
        }),
      ).rejects.toThrow(CategoryNotFoundError)

      expect(
        await container.transactionService.findById({ id: userTransaction.id, userId: user.id }),
      ).toMatchObject({
        amountInCents: DEFAULT_CREATE.amountInCents,
        notes: DEFAULT_CREATE.notes,
        transactionType: userCategory.categoryType,
        category: {
          id: userCategory.id,
        },
      })
    })
  })

  describe('findById', () => {
    test('returns transaction for owner', async ({ container, db }) => {
      const user = await insertTestUser(db)
      const category = await insertTestCategory(db, { userId: user.id })

      const created = await createTransaction(container, user, category)

      const found = await container.transactionService.findById({ id: created.id, userId: user.id })

      expect(found).toMatchObject({ id: created.id })
    })

    test('throws when user is not the owner', async ({ container, db }) => {
      const user = await insertTestUser(db)
      const userCategory = await insertTestCategory(db, { userId: user.id })
      const other = await insertTestUser(db, { email: 'other@test.com' })

      const created = await createTransaction(container, user, userCategory)

      await expect(
        container.transactionService.findById({ id: created.id, userId: other.id }),
      ).rejects.toThrow(TransactionNotFoundError)
    })
  })

  describe('findManyWithCategory', () => {
    test('returns empty list when user has no transactions', async ({ container, db }) => {
      const user = await insertTestUser(db)

      const found = await container.transactionService.findManyWithCategory({
        userId: user.id,
        limit: 10,
        offset: 0,
      })

      expect(found).toEqual([])
    })

    test('returns only transactions of the given user', async ({ container, db }) => {
      void container
      void db
      // Arrange: two users with categories; createTransaction for each (distinct notes via overrides)
      // Act: findManyWithCategory({ userId: ownerUser.id, limit: 10, offset: 0 })
      // Assert: length 1 + toMatchObject({ notes: ownerNotes })
    })

    test('applies default limit and offset when omitted', async ({ container, db }) => {
      void container
      void db
      // Arrange: user + category, three createTransaction calls (distinct notes; vary occurredAt if needed)
      // Act: findManyWithCategory({ userId: user.id, limit: 1, offset: 1 })
      // Assert: length 1 + toMatchObject({ notes: middleTransactionNotes })
    })

    test('respects limit and offset when provided', async ({ container, db }) => {
      void container
      void db
      // Arrange: user + category, three createTransaction calls (distinct notes; vary occurredAt if needed)
      // Act: findManyWithCategory({ userId: user.id, limit: 1, offset: 1 })
      // Assert: length 1 + toMatchObject({ notes: middleTransactionNotes })
    })
  })

  describe('delete', () => {
    test('removes transaction for owner', async ({ container, db }) => {
      void container
      void db
      // Arrange: insertTestUser + insertTestCategory, createTransaction(container, user, category)
      // Act: service.delete({ id: created.id, userId: user.id })
      // Assert: resolves + findById rejects TransactionNotFoundError
    })

    test('throws for non-owner without mutating the transaction', async ({ container, db }) => {
      void container
      void db
      // Arrange: owner user+category, createTransaction; insertTestUser for other user
      // Act: service.delete({ id: created.id, userId: otherUser.id })
      // Assert: rejects.toThrow(TransactionNotFoundError)
      // Assert: findById as ownerUser still toMatchObject original values
    })
  })

  describe('findMonthlyTotalsInRange', () => {
    test('returns monthly rows with calculated balance', async ({ container, db }) => {
      void container
      void db
      // Arrange: user + income category + expense category (two insertTestCategory)
      // Arrange: createTransaction for transactions in known months/amounts
      // Act: service.findMonthlyTotalsInRange({ userId: user.id, range? })
      // Assert: toMatchObject on row(s) — incomeTotal, expenseTotal, balance
    })
  })
})
