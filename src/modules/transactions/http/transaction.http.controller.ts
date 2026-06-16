import type { Request, Response } from 'express'
import type { TransactionService } from '../transaction.service.js'
import {
  createTransactionBodySchema,
  transactionHttpResponseSchema,
  transactionIdParamsSchema,
  transactionQueryParamsSchema,
  transactionsHttpResponseSchema,
  updateTransactionBodySchema,
} from './transaction.http.dto.js'

export class TransactionHttpController {
  constructor(private readonly transactionService: TransactionService) {}

  async create(req: Request, res: Response) {
    const input = createTransactionBodySchema.parse(req.body)
    const userId = req.auth.userId

    const transaction = await this.transactionService.create({
      userId,
      ...input,
    })

    res.status(201).json(transactionHttpResponseSchema.parse(transaction))
  }

  async update(req: Request, res: Response) {
    const { id } = transactionIdParamsSchema.parse(req.params)
    const input = updateTransactionBodySchema.parse(req.body)
    const userId = req.auth.userId

    const transaction = await this.transactionService.update({
      id,
      userId,
      ...input,
    })

    res.status(200).json(transactionHttpResponseSchema.parse(transaction))
  }

  async findById(req: Request, res: Response) {
    const { id } = transactionIdParamsSchema.parse(req.params)
    const userId = req.auth.userId

    const transaction = await this.transactionService.findById({
      id,
      userId,
    })

    res.status(200).json(transactionHttpResponseSchema.parse(transaction))
  }

  async findAll(req: Request, res: Response) {
    const { limit, offset } = transactionQueryParamsSchema.parse(req.query)
    const userId = req.auth.userId

    const transactions = await this.transactionService.findAll({
      userId,
      limit,
      offset,
    })

    res.status(200).json(transactionsHttpResponseSchema.parse(transactions))
  }

  async delete(req: Request, res: Response) {
    const { id } = transactionIdParamsSchema.parse(req.params)
    const userId = req.auth.userId

    await this.transactionService.delete({
      id,
      userId,
    })

    res.status(204).send()
  }
}
