import type { Database } from '../../../database/db.js'
import type { PartnershipRepository } from '../partnerships/partnership.repository.js'
import { partnerOf } from '../partnerships/partnership.utils.js'
import { ActivePartnershipNotFoundError } from '../shared-expenses/shared-expense.errors.js'
import type { SharedExpenseRepository } from '../shared-expenses/shared-expense.repository.js'
import { NoPendingExpensesError, NothingToSettleError } from './settlement.errors.js'
import type { SettlementRepository } from './settlement.repository.js'
import type { PendingBalance, Settlement } from './settlement.types.js'

export class SettlementService {
  constructor(
    private readonly settlementRepository: SettlementRepository,
    private readonly sharedExpenseRepository: SharedExpenseRepository,
    private readonly partnershipRepository: PartnershipRepository,
    private readonly db: Database,
  ) {}

  async getPendingBalance(userId: string): Promise<PendingBalance> {
    const partnership = await this.partnershipRepository.findUserActivePartnership(userId)
    if (!partnership) throw new ActivePartnershipNotFoundError()

    const partnerId = partnerOf(partnership, userId)
    const pendingExpenses = await this.sharedExpenseRepository.findPendingByPartnership(
      partnership.id,
    )

    if (pendingExpenses.length === 0) throw new NoPendingExpensesError()

    const userTotals = pendingExpenses
      .filter((expense) => expense.owedUserId === userId)
      .reduce((sum, expense) => sum + expense.owedAmountCents, 0)

    const partnerTotals = pendingExpenses
      .filter((expense) => expense.owedUserId === partnerId)
      .reduce((sum, expense) => sum + expense.owedAmountCents, 0)

    return {
      partnershipId: partnership.id,
      partnerId,
      userTotals,
      partnerTotals,
      totalAmountCents: userTotals - partnerTotals,
      pendingExpenses,
    }
  }

  async settle(userId: string): Promise<Settlement> {
    const balance = await this.getPendingBalance(userId)
    if (balance.totalAmountCents <= 0) throw new NothingToSettleError()

    return this.db.transaction(async (tx) => {
      const settlement = await this.settlementRepository.create(
        {
          partnershipId: balance.partnershipId,
          fromUserId: userId,
          toUserId: balance.partnerId,
          totalAmountCents: balance.totalAmountCents,
        },
        tx,
      )

      await this.sharedExpenseRepository.markAsSettled(
        balance.pendingExpenses.map((expense) => expense.id),
        settlement.id,
        tx,
      )

      return settlement
    })
  }
}
