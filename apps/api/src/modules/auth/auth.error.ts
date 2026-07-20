import { AppError } from '../../shared/app-error.js'

export class InvalidCredentialsError extends AppError {
  constructor() {
    super('Invalid credentials error', 401)
    this.name = 'InvalidCredentialsError'
  }
}

export class Unauthorized extends AppError {
  constructor() {
    super('Unauthorized', 401)
    this.name = 'Unauthorized'
  }
}
