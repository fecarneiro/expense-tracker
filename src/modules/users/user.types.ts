import type { UserRow } from '../../database/schemas/user.schema.js'

export type User = UserRow
type Password = string

export type CreateUserInput = Pick<User, 'email'> & {
  password: Password
  currency?: User['currency'] | undefined
  locale?: User['locale'] | undefined
  timeZone?: User['timeZone'] | undefined
}

export type FindUserByIdInput = Pick<User, 'id'>

export type ChangePasswordInput = Pick<User, 'id'> & {
  currentPassword: Password
  newPassword: Password
}

export type UpdatePasswordInput = Pick<User, 'id'> & {
  passwordHash: Password // Repository input
}

export type FindUserByEmailInput = Pick<User, 'email'>

export type VerifyPasswordInput = Pick<User, 'email'> & {
  password: Password
}

export type DeleteUserInput = Pick<User, 'id'> & {
  password: Password
}

export type DeletedUser = Pick<User, 'id'>
