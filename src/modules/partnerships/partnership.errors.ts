import { AppError } from '../../shared/app-error.js'

export class CannotPartnerWithYourselfError extends AppError {
  constructor() {
    super('Cannot partner with yourself', 400)
    this.name = 'CannotPartnerWithYourselfError'
  }
}
export class InviteeAlreadyHasActivePartnership extends AppError {
  constructor() {
    super('Invitee already has active partnership', 400)
    this.name = 'InviteeAlreadyHasActivePartnership'
  }
}

export class InviterAlreadyHasActivePartnership extends AppError {
  constructor() {
    super('Inviter already has active partnership', 400)
    this.name = 'InviterAlreadyHasActivePartnership'
  }
}

export class PartnershipCreationError extends AppError {
  constructor() {
    super('Could not create partnership', 500)
    this.name = 'PartnershipCreationError'
  }
}

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
