import { AppError } from '../../shared/app-error.js'

export class ConnectionCreationError extends AppError {
  constructor() {
    super('Could not create connection', 500)
    this.name = 'ConnectionCreationError'
  }
}
