import { AppError } from '../../shared/app-error.js'

export class EmailAlreadyInUseError extends AppError {
  constructor() {
    super('Email already in use', 409)
    this.name = 'EmailAlreadyInUseError'
  }
}

export class UserCreationFailedError extends AppError {
  constructor() {
    super('Could not create user', 500)
    this.name = 'UserCreationFailedError'
  }
}
