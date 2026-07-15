import { inArray } from 'drizzle-orm'
import { describe } from 'vitest'
import type { Database } from '../../../database/db.js'
import { transactionsTable } from '../../../database/schemas/transactions.schema.js'
import { insertTestCategory } from '../../../tests/factories/category.factory.js'
import { createTestPartnership } from '../../../tests/factories/partnership.factory.js'
import { expect, integrationTest as test } from '../../../tests/fixtures/integration.fixture.js'
import { CATEGORY_SYSTEM_KEY } from '../../categories/category.defaults.js'
import { SPLIT_TYPE } from './shared-expense.types.js'

async function listTransactionsForUsers(db: Database, userIds: string[]) {
  return db.select().from(transactionsTable).where(inArray(transactionsTable.userId, userIds))
}

describe('SharedExpenseService', () => {
  describe('create', () => {
    test('HALF without mapping creates shared expense and both user transactions', async ({
      container,
      db,
    }) => {
      const {
        inviter: payer,
        invitee: partner,
        partnership,
        sharedCategory,
      } = await createTestPartnership(container, db, { withUserCategoryDefaults: true })

      const uncategorizedPayer = await container.categoryService.findBySystemKey({
        userId: payer.id,
        systemKey: CATEGORY_SYSTEM_KEY.UNCATEGORIZED,
      })
      const uncategorizedPartner = await container.categoryService.findBySystemKey({
        userId: partner.id,
        systemKey: CATEGORY_SYSTEM_KEY.UNCATEGORIZED,
      })

      const sharedExpense = await container.sharedExpenseService.create({
        userId: payer.id,
        totalAmountCents: 1001,
        sharedCategoryId: sharedCategory.id,
        split: SPLIT_TYPE.HALF,
      })

      expect(sharedExpense).toMatchObject({
        id: expect.any(String),
        partnershipId: partnership.id,
        payerUserId: payer.id,
        owedUserId: partner.id,
        totalAmountCents: 1001,
        owedAmountCents: 500,
        sharedCategoryId: sharedCategory.id,
        settlementId: null,
        createdAt: expect.any(Date),
      })

      const transactions = await listTransactionsForUsers(db, [payer.id, partner.id])
      expect(transactions).toHaveLength(2)
      expect(transactions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            userId: payer.id,
            createdByUserId: payer.id,
            amountCents: 501,
            categoryId: uncategorizedPayer.id,
            transactionType: 'expense',
            description: null,
          }),
          expect.objectContaining({
            userId: partner.id,
            createdByUserId: payer.id,
            amountCents: 500,
            categoryId: uncategorizedPartner.id,
            transactionType: 'expense',
            description: null,
          }),
        ]),
      )
    })

    test('FULL without mapping creates shared expense and only partner transaction', async ({
      container,
      db,
    }) => {
      const {
        inviter: payer,
        invitee: partner,
        partnership,
        sharedCategory,
      } = await createTestPartnership(container, db, { withUserCategoryDefaults: true })

      const uncategorizedPartner = await container.categoryService.findBySystemKey({
        userId: partner.id,
        systemKey: CATEGORY_SYSTEM_KEY.UNCATEGORIZED,
      })

      const sharedExpense = await container.sharedExpenseService.create({
        userId: payer.id,
        totalAmountCents: 2000,
        sharedCategoryId: sharedCategory.id,
        split: SPLIT_TYPE.FULL,
      })

      expect(sharedExpense).toMatchObject({
        partnershipId: partnership.id,
        payerUserId: payer.id,
        owedUserId: partner.id,
        totalAmountCents: 2000,
        owedAmountCents: 2000,
        sharedCategoryId: sharedCategory.id,
        settlementId: null,
      })

      const transactions = await listTransactionsForUsers(db, [payer.id, partner.id])
      expect(transactions).toHaveLength(1)
      expect(transactions[0]).toMatchObject({
        userId: partner.id,
        createdByUserId: payer.id,
        amountCents: 2000,
        categoryId: uncategorizedPartner.id,
        transactionType: 'expense',
        description: null,
      })
    })

    test('HALF with mapping uses mapped categories on both transactions', async ({
      container,
      db,
    }) => {
      const {
        inviter: payer,
        invitee: partner,
        partnership,
        sharedCategory,
      } = await createTestPartnership(container, db, { withUserCategoryDefaults: true })

      const payerCategory = await insertTestCategory(db, {
        userId: payer.id,
        name: 'Shared Eating Out',
      })
      const partnerCategory = await insertTestCategory(db, {
        userId: partner.id,
        name: 'Shared Eating Out',
      })

      await container.sharedCategoryService.mapUserCategoryToShared({
        userId: payer.id,
        partnershipId: partnership.id,
        userCategoryId: payerCategory.id,
        sharedCategoryId: sharedCategory.id,
      })
      await container.sharedCategoryService.mapUserCategoryToShared({
        userId: partner.id,
        partnershipId: partnership.id,
        userCategoryId: partnerCategory.id,
        sharedCategoryId: sharedCategory.id,
      })

      await container.sharedExpenseService.create({
        userId: payer.id,
        totalAmountCents: 1000,
        sharedCategoryId: sharedCategory.id,
        split: SPLIT_TYPE.HALF,
      })

      const transactions = await listTransactionsForUsers(db, [payer.id, partner.id])
      expect(transactions).toHaveLength(2)
      expect(transactions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            userId: payer.id,
            amountCents: 500,
            categoryId: payerCategory.id,
          }),
          expect.objectContaining({
            userId: partner.id,
            amountCents: 500,
            categoryId: partnerCategory.id,
          }),
        ]),
      )
    })
  })
})
