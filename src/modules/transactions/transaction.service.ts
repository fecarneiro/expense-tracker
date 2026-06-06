import type { PublicTransactionWithCategory } from '../../database/schemas/transaction.schema.js'
import type {
  CreateTransactionInput,
  DeleteTransactionInput,
  FindAllTransactionsInput,
  FindTransactionByIdInput,
  UpdateTransactionInput,
} from './transaction.dto.js'
import { TransactionCreationFailedError, TransactionNotFoundError } from './transaction.error.js'
import type { TransactionRepository } from './transaction.repository.js'

export class TransactionService {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async create(data: CreateTransactionInput): Promise<PublicTransactionWithCategory> {
    const transaction = await this.transactionRepository.create(data)

    if (!transaction) throw new TransactionCreationFailedError()

    return transaction
  }

  async update(data: UpdateTransactionInput): Promise<PublicTransactionWithCategory> {
    const transaction = await this.transactionRepository.update(data)

    if (!transaction) throw new TransactionNotFoundError()

    return transaction
  }

  async findById(data: FindTransactionByIdInput): Promise<PublicTransactionWithCategory> {
    const transaction = await this.transactionRepository.findById(data)

    if (!transaction) throw new TransactionNotFoundError()

    return transaction
  }

  async findAll(data: FindAllTransactionsInput): Promise<PublicTransactionWithCategory[]> {
    const transactions = await this.transactionRepository.findAll(data)

    return transactions
  }

  async delete(data: DeleteTransactionInput): Promise<void> {
    const transaction = await this.transactionRepository.delete(data)

    if (!transaction) throw new TransactionNotFoundError()
  }
}
