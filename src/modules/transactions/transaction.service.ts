import { CategoryNotFoundError } from '../categories/category.error.js'
import type { CategoryRepository } from '../categories/category.repository.js'
import type { UserRepository } from '../users/user.repository.js'
import type { UserService } from '../users/user.service.js'
import { LIST_DEFAULT_LIMIT, LIST_DEFAULT_OFFSET } from './transaction.constants.js'
import {
  InvalidTransactionRangeError,
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
  FindMonthlyTotalsInRangeInput,
  FindTransactionByIdInput,
  MonthlyTotalsInRangeRow,
  UpdateTransactionInput,
} from './transaction.types.js'

export class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly userRepository: UserRepository,
    private readonly userService: UserService,
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
    const limit = data.limit ?? LIST_DEFAULT_LIMIT
    const offset = data.offset ?? LIST_DEFAULT_OFFSET

    const transactions = await this.transactionRepository.findManyWithCategory({
      userId: data.userId,
      limit,
      offset,
    })

    return transactions.map(toTransactionResponse)
  }

  async findMonthlyTotalsInRange(
    data: FindMonthlyTotalsInRangeInput,
  ): Promise<MonthlyTotalsInRangeRow[]> {
    const { timeZone } = await this.userService.getUserPreferences({ id: data.userId })
    const { from, until } = data.range ?? {}

    if (from != null && until != null && from >= until) {
      throw new InvalidTransactionRangeError()
    }

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
