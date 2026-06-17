import { AppError } from '../../shared/app-error.js'

export class TelegramAccountAlreadyExistsError extends AppError {
  constructor() {
    super('Telegram account already exists', 409)
    this.name = 'TelegramAccountAlreadyExistsError'
  }
}

export class TelegramGenerateCodeFailedError extends AppError {
  constructor() {
    super('Could not generate telegram code', 500)
    this.name = 'TelegramGenerateCodeFailedError'
  }
}

export class TelegramLinkAccountFailedError extends AppError {
  constructor() {
    super('Could not link telegram account', 500)
    this.name = 'TelegramLinkAccountFailedError'
  }
}
