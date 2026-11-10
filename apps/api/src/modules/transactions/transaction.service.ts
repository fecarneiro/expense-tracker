import type {
  ExpenseCategoryTotal,
  MonthlyBalanceRow,
  TransactionResponse,
  TransactionsResponse,
} from '@expense-tracker/contracts'
import { LIST_DEFAULT_LIMIT, LIST_DEFAULT_OFFSET } from '../../shared/pagination.js'
import { CategoryNotFoundError } from '../categories/category.error.js'
import type { CategoryRepository } from '../categories/category.repository.js'
import type { UserRepository } from '../users/user.repository.js'
import type { UserService } from '../users/user.service.js'
import {
  InvalidTransactionRangeError,
  TransactionCreatedByUserNotFoundError,
  TransactionCreationFailedError,
  TransactionNotFoundError,
} from './transaction.error.js'
import { toTransactionResponse } from './transaction.mapper.js'
import type { TransactionRepository } from './transaction.repository.js'
import type {
  CreateTransactionInput,
  DeleteTransactionInput,
  FindExpenseCategoryTotalsInput,
  FindManyTransactionsInput,
  FindMonthlyTotalsInRangeInput,
  FindTransactionByIdInput,
  TransactionRange,
  UpdateTransactionInput,
} from './transaction.types.js'

function assertValidRange({ from, until }: TransactionRange) {
  if (from != null && until != null && from >= until) {
    throw new InvalidTransactionRangeError()
  }
}

export class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly userRepository: UserRepository,
    private readonly userService: UserService,
  ) {}

  // TODO: createdBy user id as params too
  // how to create for another user if userId came from middleware
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
      description: data.description ?? null,
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

  async findManyWithCategory(data: FindManyTransactionsInput): Promise<TransactionsResponse> {
    assertValidRange(data)

    const limit = data.limit ?? LIST_DEFAULT_LIMIT
    const offset = data.offset ?? LIST_DEFAULT_OFFSET

    const { rows, total } = await this.transactionRepository.findManyWithCategory({
      userId: data.userId,
      limit,
      offset,
      from: data.from,
      until: data.until,
    })

    return {
      data: rows.map(toTransactionResponse),
      meta: { total, limit, offset },
    }
  }

  async findExpenseCategoryTotals(
    data: FindExpenseCategoryTotalsInput,
  ): Promise<ExpenseCategoryTotal[]> {
    assertValidRange(data)

    return this.transactionRepository.findExpenseCategoryTotals(data)
  }

  async findMonthlyTotalsInRange(
    data: FindMonthlyTotalsInRangeInput,
  ): Promise<MonthlyBalanceRow[]> {
    const { timeZone } = await this.userService.getUserPreferences({ id: data.userId })
    const { from, until } = data.range ?? {}

    assertValidRange({ from, until })

    const rows = await this.transactionRepository.findMonthlyTotalsInRange({
      userId: data.userId,
      timeZone,
      from,
      until,
    })

    return rows.map((row) => ({
      ...row,
      balance: row.incomeTotal - row.expenseTotal,
    }))
  }

  async delete(data: DeleteTransactionInput): Promise<void> {
    const deleted = await this.transactionRepository.delete(data)
    if (!deleted) throw new TransactionNotFoundError()
  }
}
