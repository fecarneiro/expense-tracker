import type { PendingBalance } from '@expense-tracker/contracts'
import type { Request, Response } from 'express'
import { ActivePartnershipNotFoundError } from '../../shared-expenses/shared-expense.errors.js'
import type { SettlementService } from '../settlement.service.js'

export class SettlementHttpController {
  constructor(private readonly settlementService: SettlementService) {}

  async getPendingBalance(req: Request, res: Response) {
    if (!req.partnership) throw new ActivePartnershipNotFoundError()

    const balance = await this.settlementService.getPendingBalance(req.auth.userId)

    const response: PendingBalance = {
      partnershipId: balance.partnershipId,
      partnerId: balance.partnerId,
      userTotals: balance.userTotals,
      partnerTotals: balance.partnerTotals,
      totalAmountCents: balance.totalAmountCents,
    }

    res.status(200).json(response)
  }

  async settle(req: Request, res: Response) {
    if (!req.partnership) throw new ActivePartnershipNotFoundError()

    const settlement = await this.settlementService.settle(req.auth.userId)
    res.status(201).json(settlement)
  }
}
