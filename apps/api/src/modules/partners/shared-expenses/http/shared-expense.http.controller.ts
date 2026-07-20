import type { Request, Response } from 'express'
import { ActivePartnershipNotFoundError } from '../shared-expense.errors.js'
import {
  createSharedExpenseBodySchema,
  sharedExpenseReportQuerySchema,
} from '../shared-expense.schemas.js'
import type { SharedExpenseService } from '../shared-expense.service.js'

export class SharedExpenseHttpController {
  constructor(private readonly sharedExpenseService: SharedExpenseService) {}

  async create(req: Request, res: Response) {
    if (!req.partnership) throw new ActivePartnershipNotFoundError()

    const body = createSharedExpenseBodySchema.parse(req.body)
    const sharedExpense = await this.sharedExpenseService.create({
      userId: req.auth.userId,
      totalAmountCents: body.totalAmountCents,
      sharedCategoryId: body.sharedCategoryId,
      split: body.split,
      description: body.description,
    })

    // TODO: remove users ID from response
    res.status(201).json(sharedExpense)
  }

  // Front
  async list(req: Request, res: Response) {
    if (!req.partnership) throw new ActivePartnershipNotFoundError()

    const { limit, offset, status, payerUserId, owedUserId } = sharedExpenseReportQuerySchema.parse(
      req.query,
    )

    const report = await this.sharedExpenseService.listReport({
      partnershipId: req.partnership.id,
      limit,
      offset,
      status,
      payerUserId,
      owedUserId,
    })

    res.status(200).json(report)
  }
}
