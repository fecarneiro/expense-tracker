import { eq, isNull } from 'drizzle-orm'
import { describe } from 'vitest'
import { settlementsTable } from '../../../database/schemas/partners/settlements.schema.js'
import { sharedExpensesTable } from '../../../database/schemas/partners/shared-expenses.schema.js'
import { createTestPartnership } from '../../../tests/factories/partnership.factory.js'
import { insertTestUser } from '../../../tests/factories/user.factory.js'
import { expect, integrationTest as test } from '../../../tests/fixtures/integration.fixture.js'
import { ActivePartnershipNotFoundError } from '../shared-expenses/shared-expense.errors.js'
import { SPLIT_TYPE } from '../shared-expenses/shared-expense.types.js'
import { NoPendingExpensesError, NothingToSettleError } from './settlement.errors.js'

describe('SettlementService', () => {
  describe('getPendingBalance', () => {
    test('returns totalAmountCents as what user owes minus what partner owes', async ({
      container,
      db,
    }) => {
      const {
        inviter: alice,
        invitee: bob,
        partnership,
        sharedCategory,
      } = await createTestPartnership(container, db, { withUserCategoryDefaults: true })

      // Bob paid → Alice owes 1000
      await container.sharedExpenseService.create({
        userId: bob.id,
        totalAmountCents: 1000,
        sharedCategoryId: sharedCategory.id,
        split: SPLIT_TYPE.FULL,
      })
      // Alice paid → Bob owes 300
      await container.sharedExpenseService.create({
        userId: alice.id,
        totalAmountCents: 300,
        sharedCategoryId: sharedCategory.id,
        split: SPLIT_TYPE.FULL,
      })

      const balance = await container.settlementService.getPendingBalance(alice.id)

      expect(balance).toMatchObject({
        partnershipId: partnership.id,
        partnerId: bob.id,
        userTotals: 1000,
        partnerTotals: 300,
        totalAmountCents: 700,
      })
      expect(balance.pendingExpenses).toHaveLength(2)
    })

    test('fails when there are no pending expenses', async ({ container, db }) => {
      const { inviter: alice } = await createTestPartnership(container, db, {
        withUserCategoryDefaults: true,
      })

      await expect(container.settlementService.getPendingBalance(alice.id)).rejects.toThrow(
        NoPendingExpensesError,
      )
    })

    test('fails when user has no active partnership', async ({ container, db }) => {
      const user = await insertTestUser(db)

      await expect(container.settlementService.getPendingBalance(user.id)).rejects.toThrow(
        ActivePartnershipNotFoundError,
      )
    })
  })

  describe('settle', () => {
    test('creates settlement for the amount to settle and clears all pending expenses', async ({
      container,
      db,
    }) => {
      const {
        inviter: alice,
        invitee: bob,
        partnership,
        sharedCategory,
      } = await createTestPartnership(container, db, { withUserCategoryDefaults: true })

      await container.sharedExpenseService.create({
        userId: bob.id,
        totalAmountCents: 1000,
        sharedCategoryId: sharedCategory.id,
        split: SPLIT_TYPE.FULL,
      })
      await container.sharedExpenseService.create({
        userId: alice.id,
        totalAmountCents: 300,
        sharedCategoryId: sharedCategory.id,
        split: SPLIT_TYPE.FULL,
      })

      const settlement = await container.settlementService.settle(alice.id)

      expect(settlement).toMatchObject({
        partnershipId: partnership.id,
        fromUserId: alice.id,
        toUserId: bob.id,
        totalAmountCents: 700,
        createdAt: expect.any(Date),
      })

      const [storedSettlement] = await db
        .select()
        .from(settlementsTable)
        .where(eq(settlementsTable.id, settlement.id))
      expect(storedSettlement).toMatchObject({
        fromUserId: alice.id,
        toUserId: bob.id,
        totalAmountCents: 700,
      })

      const expenses = await db
        .select()
        .from(sharedExpensesTable)
        .where(eq(sharedExpensesTable.partnershipId, partnership.id))
      expect(expenses).toHaveLength(2)
      expect(expenses.every((expense) => expense.settlementId === settlement.id)).toBe(true)

      const pending = await db
        .select()
        .from(sharedExpensesTable)
        .where(isNull(sharedExpensesTable.settlementId))
      expect(pending).toHaveLength(0)

      await expect(container.settlementService.getPendingBalance(alice.id)).rejects.toThrow(
        NoPendingExpensesError,
      )
    })

    test('fails when the user does not owe the partner', async ({ container, db }) => {
      const {
        inviter: alice,
        invitee: bob,
        sharedCategory,
      } = await createTestPartnership(container, db, { withUserCategoryDefaults: true })

      // Alice paid → Bob owes Alice; Alice has nothing to settle
      await container.sharedExpenseService.create({
        userId: alice.id,
        totalAmountCents: 500,
        sharedCategoryId: sharedCategory.id,
        split: SPLIT_TYPE.FULL,
      })

      await expect(container.settlementService.settle(alice.id)).rejects.toThrow(
        NothingToSettleError,
      )

      const settlement = await container.settlementService.settle(bob.id)
      expect(settlement).toMatchObject({
        fromUserId: bob.id,
        toUserId: alice.id,
        totalAmountCents: 500,
      })
    })
  })
})
