import { AppError } from '../../shared/app-error.js'

export class TransactionNotFoundError extends AppError {
  constructor() {
    super('Transaction not found', 404)
    this.name = 'TransactionNotFoundError'
  }
}

export class TransactionCreationFailedError extends AppError {
  constructor() {
    super('Could not create transaction', 500)
    this.name = 'TransactionCreationFailedError'
  }
}
