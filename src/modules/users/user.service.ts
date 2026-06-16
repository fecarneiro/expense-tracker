import type { PasswordHasher } from '../../shared/password-hasher.js'
import { InvalidCredentialsError } from '../auth/auth.error.js'
import {
  AuthenticatedUserNotFoundError,
  EmailAlreadyInUseError,
  UserCreationFailedError,
} from './user.error.js'
import { toPublicUser } from './user.mapper.js'

import type { UserRepository } from './user.repository.js'
import type {
  ChangePasswordInput,
  CreateUserInput,
  DeleteUserInput,
  FindUserByEmailInput,
  FindUserByIdInput,
  PublicUser,
  User,
  VerifyPasswordInput,
} from './user.types.js'

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async createWithPassword(data: CreateUserInput): Promise<PublicUser> {
    const existingUser = await this.userRepository.findByEmail({ email: data.email })

    if (existingUser) {
      throw new EmailAlreadyInUseError()
    }

    const passwordHash = await this.passwordHasher.hash(data.password)

    const createdUser = await this.userRepository.create({
      email: data.email,
      passwordHash,
    })

    if (!createdUser) {
      throw new UserCreationFailedError()
    }

    return toPublicUser(createdUser)
  }

  async findByEmail(data: FindUserByEmailInput): Promise<User | null> {
    return this.userRepository.findByEmail({ email: data.email })
  }

  async getCurrentUser(data: FindUserByIdInput): Promise<PublicUser> {
    const user = await this.userRepository.findById({ id: data.id })
    if (!user) {
      throw new AuthenticatedUserNotFoundError()
    }
    return toPublicUser(user)
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

  async verifyPassword(data: VerifyPasswordInput): Promise<PublicUser | null> {
    const user = await this.userRepository.findByEmail({ email: data.email })

    if (!user) {
      return null
    }

    const validCredentials = await this.passwordHasher.compare(data.password, user.passwordHash)

    if (!validCredentials) {
      return null
    }

    return toPublicUser(user)
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
