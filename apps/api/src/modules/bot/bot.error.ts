import { AppError } from '../../shared/app-error.js'

export class BotAccountAlreadyExistsError extends AppError {
  constructor() {
    super('Bot account already exists', 409)
    this.name = 'BotAccountAlreadyExistsError'
  }
}

export class BotLinkAccountFailedError extends AppError {
  constructor() {
    super('Could not link bot account', 500)
    this.name = 'BotLinkAccountFailedError'
  }
}
