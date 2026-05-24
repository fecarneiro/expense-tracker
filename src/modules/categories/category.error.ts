import { AppError } from '../../shared/app-error.js'

export class CategoryAlreadyExistsError extends AppError {
  constructor() {
    super('Category already exists', 409)
    this.name = 'CategoryAlreadyExistsError'
  }
}

export class CategoryNotFoundError extends AppError {
  constructor() {
    super('Category not found', 404)
    this.name = 'CategoryNotFoundError'
  }
}

export class CategoryCreationFailedError extends AppError {
  constructor() {
    super('Could not create category', 500)
    this.name = 'CategoryCreationFailedError'
  }
}
