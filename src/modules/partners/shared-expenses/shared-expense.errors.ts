import { AppError } from '../../../shared/app-error.js'

export class ActivePartnershipNotFoundError extends AppError {
  constructor() {
    super('Active partnership not found', 404)
    this.name = 'ActivePartnershipNotFoundError'
  }
}

export class SharedExpenseCreationError extends AppError {
  constructor() {
    super('Could not create shared expense', 500)
    this.name = 'SharedExpenseCreationError'
  }
}
