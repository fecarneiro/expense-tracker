import { AppError } from '../../../shared/app-error.js'

export class SharedCategoriesCreationError extends AppError {
  constructor() {
    super('Could not create partnership shared categories', 500)
    this.name = 'SharedCategoriesCreationError'
  }
}

export class SharedCategoryNotFoundError extends AppError {
  constructor() {
    super('Shared category not found', 500)
    this.name = 'SharedCategoryNotFoundError'
  }
}

export class SharedCategoryMappingError extends AppError {
  constructor() {
    super('Could not map user category', 500)
    this.name = 'SharedCategoryMappingError'
  }
}
