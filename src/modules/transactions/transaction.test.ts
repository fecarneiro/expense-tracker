import { describe } from 'vitest'
import type { createContainer } from '../../container.js'
import type { CategoryRow } from '../../database/schemas/category.schema.js'
import type { UserRow } from '../../database/schemas/user.schema.js'
import {
  TEST_OCCURRED_AT_DATE,
  TEST_OCCURRED_AT_FAR_LATER_DATE,
  TEST_OCCURRED_AT_LATER_DATE,
  UNKNOWN_UUID,
} from '../../tests/constants.js'
import {
  DEFAULT_CATEGORY_NAME,
  insertTestCategory,
} from '../../tests/factories/category.factory.js'
import { insertOtherTestUser, insertTestUser } from '../../tests/factories/user.factory.js'
import { expect, integrationTest as test } from '../../tests/fixtures/integration.fixture.js'
import { CategoryNotFoundError } from '../categories/category.error.js'
import { LIST_DEFAULT_LIMIT } from './transaction.constants.js'
import { InvalidTransactionRangeError, TransactionNotFoundError } from './transaction.error.js'
import type { CreateTransactionInput } from './transaction.types.js'

const DEFAULT_CREATE = {
  amountCents: 1000,
  notes: 'my notes',
} as const satisfies Pick<CreateTransactionInput, 'amountCents' | 'notes'>

type CreateOverrides = Partial<Pick<CreateTransactionInput, 'amountCents' | 'notes' | 'occurredAt'>>

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
        amountCents: DEFAULT_CREATE.amountCents,
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
        amountCents: 99999,
      })

      expect(updated).toMatchObject({
        amountCents: 99999,
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
      const other = await insertOtherTestUser(db)

      const created = await createTransaction(container, user, userCategory)

      await expect(
        container.transactionService.update({
          id: created.id,
          userId: other.id,
          amountCents: 99999,
        }),
      ).rejects.toThrow(TransactionNotFoundError)

      expect(
        await container.transactionService.findById({ id: created.id, userId: user.id }),
      ).toMatchObject({
        amountCents: DEFAULT_CREATE.amountCents,
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
      const other = await insertOtherTestUser(db)
      const otherCategory = await insertTestCategory(db, { userId: other.id })

      const created = await createTransaction(container, user, userCategory)

      await expect(
        container.transactionService.update({
          id: created.id,
          userId: user.id,
          categoryId: otherCategory.id,
        }),
      ).rejects.toThrow(CategoryNotFoundError)

      expect(
        await container.transactionService.findById({ id: created.id, userId: user.id }),
      ).toMatchObject({
        amountCents: DEFAULT_CREATE.amountCents,
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
      const other = await insertOtherTestUser(db)

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
      })

      expect(found).toEqual([])
    })

    test('returns only transactions of the given user', async ({ container, db }) => {
      const user = await insertTestUser(db)
      const category = await insertTestCategory(db, { userId: user.id })
      const other = await insertOtherTestUser(db)
      const otherCategory = await insertTestCategory(db, { userId: other.id })

      const OWNER_NOTES = 'owner only'

      await createTransaction(container, user, category, { notes: OWNER_NOTES })
      await createTransaction(container, other, otherCategory)
      await createTransaction(container, other, otherCategory)

      const found = await container.transactionService.findManyWithCategory({
        userId: user.id,
      })

      expect(found).toHaveLength(1)
      expect(found[0]).toMatchObject({ notes: OWNER_NOTES })
    })

    test('applies default limit and offset when omitted', async ({ container, db }) => {
      const user = await insertTestUser(db)
      const category = await insertTestCategory(db, { userId: user.id })

      for (let i = 0; i < LIST_DEFAULT_LIMIT + 1; i++) {
        await createTransaction(container, user, category)
      }
      const found = await container.transactionService.findManyWithCategory({ userId: user.id })

      expect(found).toHaveLength(LIST_DEFAULT_LIMIT)
    })

    test('respects limit and offset when provided', async ({ container, db }) => {
      const user = await insertTestUser(db)
      const category = await insertTestCategory(db, { userId: user.id })

      await createTransaction(container, user, category, {
        notes: 'oldest',
        occurredAt: TEST_OCCURRED_AT_DATE,
      })

      const middle = await createTransaction(container, user, category, {
        notes: 'middle',
        occurredAt: TEST_OCCURRED_AT_LATER_DATE,
      })

      await createTransaction(container, user, category, {
        notes: 'newest',
        occurredAt: TEST_OCCURRED_AT_FAR_LATER_DATE,
      })

      const found = await container.transactionService.findManyWithCategory({
        userId: user.id,
        limit: 1,
        offset: 1,
      })

      expect(found).toHaveLength(1)
      expect(found[0]).toMatchObject({
        id: middle.id,
        notes: 'middle',
      })
    })
  })

  describe('delete', () => {
    test('removes transaction for owner', async ({ container, db }) => {
      const user = await insertTestUser(db)
      const category = await insertTestCategory(db, { userId: user.id })
      const created = await createTransaction(container, user, category)

      await container.transactionService.delete({ id: created.id, userId: user.id })

      await expect(
        container.transactionService.findById({ id: created.id, userId: user.id }),
      ).rejects.toThrow(TransactionNotFoundError)
    })

    test('throws for non-owner without mutating the transaction', async ({ container, db }) => {
      const user = await insertTestUser(db)
      const category = await insertTestCategory(db, { userId: user.id })
      const other = await insertOtherTestUser(db)

      const created = await createTransaction(container, user, category)

      await expect(
        container.transactionService.delete({ id: created.id, userId: other.id }),
      ).rejects.toThrow(TransactionNotFoundError)

      expect(
        await container.transactionService.findById({ id: created.id, userId: user.id }),
      ).toMatchObject({
        amountCents: DEFAULT_CREATE.amountCents,
        notes: DEFAULT_CREATE.notes,
        transactionType: category.categoryType,
        category: {
          id: category.id,
        },
      })
    })
  })

  describe('findMonthlyTotalsInRange', () => {
    test('returns monthly rows with calculated balance', async ({ container, db }) => {
      const user = await insertTestUser(db)

      const JAN_MONTH = '2026-01'
      const JAN_DATE = new Date('2026-01-01T00:00:00+00:00')
      const FEB_MONTH = '2026-02'
      const FEB_DATE = new Date('2026-02-01T00:00:00+00:00')
      const RANGE_UNTIL = new Date('2026-03-01T00:00:00+00:00')

      const JAN_INCOME = 100_000
      const JAN_EXPENSE = 40_000
      const FEB_INCOME = 50_000
      const FEB_EXPENSE = 10_000

      const incomeCategory = await insertTestCategory(db, {
        userId: user.id,
        categoryType: 'income',
      })

      const expenseCategory = await insertTestCategory(db, {
        userId: user.id,
        categoryType: 'expense',
      })

      await createTransaction(container, user, incomeCategory, {
        amountCents: JAN_INCOME,
        occurredAt: JAN_DATE,
      })

      await createTransaction(container, user, expenseCategory, {
        amountCents: JAN_EXPENSE,
        occurredAt: JAN_DATE,
      })

      await createTransaction(container, user, incomeCategory, {
        amountCents: FEB_INCOME,
        occurredAt: FEB_DATE,
      })

      await createTransaction(container, user, expenseCategory, {
        amountCents: FEB_EXPENSE,
        occurredAt: FEB_DATE,
      })

      const monthlyTotals = await container.transactionService.findMonthlyTotalsInRange({
        userId: user.id,
        range: {
          from: JAN_DATE,
          until: RANGE_UNTIL,
        },
      })

      expect(monthlyTotals).toHaveLength(2)

      expect(monthlyTotals[0]).toMatchObject({
        month: FEB_MONTH,
        incomeTotal: FEB_INCOME,
        expenseTotal: FEB_EXPENSE,
        balance: FEB_INCOME - FEB_EXPENSE,
      })

      expect(monthlyTotals[1]).toMatchObject({
        month: JAN_MONTH,
        incomeTotal: JAN_INCOME,
        expenseTotal: JAN_EXPENSE,
        balance: JAN_INCOME - JAN_EXPENSE,
      })
    })

    test('throws when from is not before until', async ({ container, db }) => {
      const user = await insertTestUser(db)

      await expect(
        container.transactionService.findMonthlyTotalsInRange({
          userId: user.id,
          range: {
            from: TEST_OCCURRED_AT_FAR_LATER_DATE,
            until: TEST_OCCURRED_AT_DATE,
          },
        }),
      ).rejects.toThrow(InvalidTransactionRangeError)
    })
  })
})
