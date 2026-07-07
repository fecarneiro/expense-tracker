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

export class TransactionCreatedByUserNotFoundError extends AppError {
  constructor() {
    super('Transaction created by user not found', 404)
    this.name = 'TransactionCreatedByUserNotFoundError'
  }
}

export class InvalidTransactionRangeError extends AppError {
  constructor() {
    super('from must be before until', 400)
    this.name = 'InvalidTransactionRangeError'
  }
}
