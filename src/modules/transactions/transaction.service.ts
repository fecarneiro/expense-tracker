import { CategoryNotFoundError } from '../categories/category.error.js'
import type { CategoryRepository } from '../categories/category.repository.js'
import type { UserRepository } from '../users/user.repository.js'
import { LIST_DEFAULT_LIMIT, LIST_DEFAULT_OFFSET } from './transaction.constants.js'
import {
  TransactionCreatedByUserNotFoundError,
  TransactionCreationFailedError,
  TransactionNotFoundError,
} from './transaction.error.js'
import { type TransactionResponse, toTransactionResponse } from './transaction.mapper.js'
import type { TransactionRepository } from './transaction.repository.js'
import type {
  CreateTransactionInput,
  DeleteTransactionInput,
  FindManyTransactionsInput,
  FindTransactionByIdInput,
  GetMonthlyBalanceInput,
  MonthlyBalanceRow,
  TransactionByRangeRow,
  UpdateTransactionInput,
} from './transaction.types.js'

export class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async create(data: CreateTransactionInput): Promise<TransactionResponse> {
    const category = await this.categoryRepository.findById({
      id: data.categoryId,
      userId: data.userId,
    })

    if (!category) throw new CategoryNotFoundError()

    const createdByUserId = data.createdByUserId ?? data.userId

    if (createdByUserId !== data.userId) {
      const foundCreatedByUser = await this.userRepository.findById({ id: createdByUserId })

      if (!foundCreatedByUser) throw new TransactionCreatedByUserNotFoundError()
    }

    const created = await this.transactionRepository.create({
      ...data,
      transactionType: category.categoryType,
      createdByUserId,
      notes: data.notes ?? null,
    })

    if (!created) throw new TransactionCreationFailedError()

    const transaction = {
      ...created,
      category: {
        id: category.id,
        name: category.name,
      },
    }

    return toTransactionResponse(transaction)
  }

  async update(data: UpdateTransactionInput): Promise<TransactionResponse> {
    let updatePayload = data

    if (data.categoryId) {
      const category = await this.categoryRepository.findById({
        id: data.categoryId,
        userId: data.userId,
      })

      if (!category) throw new CategoryNotFoundError()

      updatePayload = { ...data, transactionType: category.categoryType }
    }

    const updated = await this.transactionRepository.update(updatePayload)

    if (!updated) throw new TransactionNotFoundError()

    const transaction = await this.transactionRepository.findOneByIdWithCategory({
      id: updated.id,
      userId: data.userId,
    })

    if (!transaction) throw new TransactionNotFoundError()

    return toTransactionResponse(transaction)
  }

  async findById(data: FindTransactionByIdInput): Promise<TransactionResponse> {
    const transaction = await this.transactionRepository.findOneByIdWithCategory(data)

    if (!transaction) throw new TransactionNotFoundError()

    return toTransactionResponse(transaction)
  }

  async findManyWithCategory(data: FindManyTransactionsInput): Promise<TransactionResponse[]> {
    const transactions = await this.transactionRepository.findManyWithCategory(data)

    return transactions.map(toTransactionResponse)
  }

  async monthlyBalance(data: GetMonthlyBalanceInput): Promise<MonthlyBalanceRow[]> {
    const transactions = await this.transactionRepository.findManyByRange(data)

    return this.aggregateMonthlyBalance(transactions)
  }

  private aggregateMonthlyBalance(transactions: TransactionByRangeRow[]): MonthlyBalanceRow[] {
    const byMonth = new Map<string, { incomeTotal: number; expenseTotal: number }>()
    for (const t of transactions) {
      const month = t.occurredAt.toISOString().slice(0, 7)
      const row = byMonth.get(month) ?? { incomeTotal: 0, expenseTotal: 0 }
      if (t.transactionType === 'income') row.incomeTotal += t.amountInCents
      else row.expenseTotal += t.amountInCents
      byMonth.set(month, row)
    }
    return [...byMonth.entries()]
      .map(([month, totals]) => ({
        month,
        ...totals,
        balance: totals.incomeTotal - totals.expenseTotal,
      }))
      .sort((a, b) => b.month.localeCompare(a.month))
  }

  async delete(data: DeleteTransactionInput): Promise<void> {
    const deleted = await this.transactionRepository.delete(data)
    if (!deleted) throw new TransactionNotFoundError()
  }
}
