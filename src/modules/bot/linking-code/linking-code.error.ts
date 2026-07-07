import { AppError } from '../../../shared/app-error.js'

export class InvalidOrExpiredLinkingCodeError extends AppError {
  constructor() {
    super('Invalid or expired linking code. Please generate a new one and run /link again.', 400)
    this.name = 'InvalidOrExpiredLinkingCodeError'
  }
}

export class BotLinkingRateLimitError extends AppError {
  constructor() {
    super('Too many attempts. Please try again later.', 429)
    this.name = 'BotLinkingRateLimitError'
  }
}

export class BotGenerateCodeFailedError extends AppError {
  constructor() {
    super('Could not generate bot linking code', 500)
    this.name = 'BotGenerateCodeFailedError'
  }
}
