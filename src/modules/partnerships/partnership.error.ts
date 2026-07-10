import { AppError } from '../../shared/app-error.js'

export class PartnershipCreationError extends AppError {
  constructor() {
    super('Could not create partnership', 500)
    this.name = 'PartnershipCreationError'
  }
}
