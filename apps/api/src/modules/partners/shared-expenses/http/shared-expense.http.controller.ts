import type { Request, Response } from 'express'
import { ActivePartnershipNotFoundError } from '../shared-expense.errors.js'
import { createSharedExpenseBodySchema } from '../shared-expense.schemas.js'
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
    })

    // TODO: remove users ID from response
    res.status(201).json(sharedExpense)
  }

  // Front
  async list(req: Request, res: Response) {
    if (!req.partnership) throw new ActivePartnershipNotFoundError()

    const data = await this.sharedExpenseService.listReport(req.partnership.id)
    res.status(200).json({ data })
  }
}
