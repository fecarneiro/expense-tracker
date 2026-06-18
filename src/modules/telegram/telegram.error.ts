import { AppError } from '../../shared/app-error.js'

export class TelegramAccountAlreadyExistsError extends AppError {
  constructor() {
    super('Telegram account already exists', 409)
    this.name = 'TelegramAccountAlreadyExistsError'
  }
}

export class TelegramLinkAccountFailedError extends AppError {
  constructor() {
    super('Could not link telegram account', 500)
    this.name = 'TelegramLinkAccountFailedError'
  }
}
