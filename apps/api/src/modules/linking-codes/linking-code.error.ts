import { AppError } from '../../shared/app-error.js'

export class InvalidOrExpiredLinkingCodeError extends AppError {
  constructor() {
    super('Invalid or expired linking code.', 400)
    this.name = 'InvalidOrExpiredLinkingCodeError'
  }
}

export class LinkingCodeGenerationError extends AppError {
  constructor() {
    super('Could not generate linking code', 500)
    this.name = 'LinkingCodeGenerationError'
  }
}
