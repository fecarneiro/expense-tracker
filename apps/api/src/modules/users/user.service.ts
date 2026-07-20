import type { DatabaseClient } from '../../database/db.js'
import type { PasswordHasher } from '../../shared/password-hasher.js'
import { InvalidCredentialsError } from '../auth/auth.error.js'
import {
  DEFAULT_USER_CURRENCY,
  DEFAULT_USER_LOCALE,
  DEFAULT_USER_TIME_ZONE,
} from './user.constants.js'
import { AuthenticatedUserNotFoundError } from './user.error.js'
import {
  toUserPreferences,
  toUserResponse,
  type UserPreferences,
  type UserResponse,
} from './user.mapper.js'

import type { UserRepository } from './user.repository.js'
import type {
  ChangePasswordInput,
  CreateUserInput,
  DeleteUserInput,
  FindUserByEmailInput,
  FindUserByIdInput,
  User,
  VerifyPasswordInput,
} from './user.types.js'

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async createWithPassword(
    data: CreateUserInput,
    dbClient?: DatabaseClient,
  ): Promise<UserResponse> {
    const passwordHash = await this.passwordHasher.hash(data.password)

    const createdUser = await this.userRepository.create(
      {
        email: data.email,
        passwordHash,
        currency: data.currency ?? DEFAULT_USER_CURRENCY,
        locale: data.locale ?? DEFAULT_USER_LOCALE,
        timeZone: data.timeZone ?? DEFAULT_USER_TIME_ZONE,
      },
      dbClient,
    )
    return toUserResponse(createdUser)
  }

  async findByEmail(data: FindUserByEmailInput): Promise<User | null> {
    return this.userRepository.findByEmail({ email: data.email })
  }

  async getCurrentUser(data: FindUserByIdInput): Promise<UserResponse> {
    const user = await this.userRepository.findById({ id: data.id })
    if (!user) {
      throw new AuthenticatedUserNotFoundError()
    }
    return toUserResponse(user)
  }

  async getUserPreferences(data: FindUserByIdInput): Promise<UserPreferences> {
    const user = await this.userRepository.findById({ id: data.id })
    if (!user) {
      throw new AuthenticatedUserNotFoundError()
    }
    return toUserPreferences(user)
  }

  async changePassword(data: ChangePasswordInput): Promise<void> {
    const user = await this.userRepository.findById({ id: data.id })

    if (!user) {
      throw new AuthenticatedUserNotFoundError()
    }

    const validCredentials = await this.passwordHasher.compare(
      data.currentPassword,
      user.passwordHash,
    )

    if (!validCredentials) {
      throw new InvalidCredentialsError()
    }

    const newPasswordHashed = await this.passwordHasher.hash(data.newPassword)

    await this.userRepository.updatePassword({
      id: user.id,
      passwordHash: newPasswordHashed,
    })
  }

  async verifyPassword(data: VerifyPasswordInput): Promise<UserResponse | null> {
    const user = await this.userRepository.findByEmail({ email: data.email })

    if (!user) {
      return null
    }

    const validCredentials = await this.passwordHasher.compare(data.password, user.passwordHash)

    if (!validCredentials) {
      return null
    }

    return toUserResponse(user)
  }

  async delete(data: DeleteUserInput): Promise<void> {
    const user = await this.userRepository.findById({ id: data.id })

    if (!user) {
      throw new AuthenticatedUserNotFoundError()
    }

    const validCredentials = await this.passwordHasher.compare(data.password, user.passwordHash)

    if (!validCredentials) {
      throw new InvalidCredentialsError()
    }

    await this.userRepository.delete({ id: data.id })
  }
}
