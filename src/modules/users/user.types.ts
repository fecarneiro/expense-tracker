export interface User {
  id: string
  email: string
  passwordHash: string
  createdAt: Date
}

export type PublicUser = Pick<User, 'id' | 'email'>

export type CreateUserInput = {
  email: string
  password: string
}

export type CreateUserRepositoryInput = {
  email: string
  passwordHash: string
}

export type FindUserByIdInput = Pick<User, 'id'>

export type ChangePasswordInput = {
  id: string
  currentPassword: string
  newPassword: string
}

export type UpdatePasswordRepositoryInput = Pick<User, 'id' | 'passwordHash'>

export type FindUserByEmailInput = Pick<User, 'email'>

export type VerifyPasswordInput = {
  email: string
  password: string
}

export type DeleteUserInput = {
  id: string
  password: string
}

export type DeleteUserRepositoryInput = Pick<User, 'id'>

export type DeletedUser = Pick<User, 'id'>
