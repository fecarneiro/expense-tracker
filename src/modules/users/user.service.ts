import * as z from 'zod'
import type { PasswordHasher } from '../../shared/auth/password-hasher.js'
import type {
  ChangePasswordInput,
  CreateUserInput,
  SignInCredentials,
  UserResponse,
} from './user.dto.js'
import {
  EmailAlreadyInUseError,
  UserCreationFailedError,
} from './user.error.js'
import type { UserRepository } from './user.repository.js'

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async createNewUser(data: CreateUserInput): Promise<UserResponse> {
    const { email, password } = data

    const existingUser = await this.userRepository.findByEmail(email)

    if (existingUser) {
      throw new EmailAlreadyInUseError()
    }

    const passwordHash = await this.passwordHasher.hash(password)

    // JWT
    const newUser = await this.userRepository.create({ email, passwordHash })

    if (!newUser) {
      throw new UserCreationFailedError()
    }
    return newUser
  }

  verifyUserCredentials(data: SignInCredentials): Promise<UserResponse> {
    throw new Error('Not implemented')
  }

  changeUserPassword(data: ChangePasswordInput): Promise<void> {
    throw new Error('Not implemented')
  }

  deleteUser(id: string): Promise<void> {
    throw new Error('Not implemented')
  }
}
