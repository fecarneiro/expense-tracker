import type { PendingBalance as PendingBalanceSummary } from '@expense-tracker/contracts'
import type { SharedExpense } from '../shared-expenses/shared-expense.types.js'

export type Settlement = {
  id: string
  partnershipId: string
  fromUserId: string
  toUserId: string
  totalAmountCents: number
  createdAt: Date
}

/** Internal balance: HTTP summary + pending rows used by settle/bot. */
export type PendingBalance = PendingBalanceSummary & {
  pendingExpenses: SharedExpense[]
}
