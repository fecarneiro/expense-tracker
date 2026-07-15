import { AppError } from '../../../shared/app-error.js'

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

export class PartnershipNotFoundError extends AppError {
  constructor() {
    super('Partnership not found', 404)
    this.name = 'PartnershipNotFoundError'
  }
}

export class NotAPartnershipMemberError extends AppError {
  constructor() {
    super('User is not a member of this partnership', 403)
    this.name = 'NotAPartnershipMemberError'
  }
}
