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

export class CategoryInUseError extends AppError {
  constructor() {
    super('Category in use', 409)
    this.name = 'CategoryInUseError'
  }
}

export class CategoryCreationFailedError extends AppError {
  constructor() {
    super('Could not create category', 500)
    this.name = 'CategoryCreationFailedError'
  }
}

export class CategorySystemProtectedError extends AppError {
  constructor() {
    super('System category cannot be modified', 403)
    this.name = 'CategorySystemProtectedError'
  }
}
