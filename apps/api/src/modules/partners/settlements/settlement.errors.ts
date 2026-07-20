import { AppError } from '../../../shared/app-error.js'

export class NothingToSettleError extends AppError {
  constructor() {
    super('Nothing to settle', 400)
    this.name = 'NothingToSettleError'
  }
}

export class SettlementCreationError extends AppError {
  constructor() {
    super('Could not create settlement', 500)
    this.name = 'SettlementCreationError'
  }
}
