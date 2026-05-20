import type { PasswordHasher } from '../../shared/password-hasher.js'
import type {
  ChangePasswordInput,
  CreateUserInput,
  SignInCredentials,
  UserResponse,
} from './user.dto.js'
import {
  AuthenticatedUserNotFoundError,
  EmailAlreadyInUseError,
  InvalidCredentialsError,
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

    const newUser = await this.userRepository.create({ email, passwordHash })

    if (!newUser) {
      throw new UserCreationFailedError()
    }

    return newUser
  }

  async verifyUserCredentials(data: SignInCredentials): Promise<UserResponse> {
    const { email, password } = data

    const user = await this.userRepository.findByEmail(email)

    if (!user) {
      throw new InvalidCredentialsError()
    }

    const validCredentials = await this.passwordHasher.compare(
      password,
      user.passwordHash,
    )

    if (!validCredentials) {
      throw new InvalidCredentialsError()
    }

    return { email: user.email, id: user.id }
  }

  async changeUserPassword(
    userId: string,
    data: ChangePasswordInput,
  ): Promise<void> {
    const user = await this.userRepository.findById(userId)

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

    await this.userRepository.updatePassword(userId, newPasswordHashed)
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      throw new AuthenticatedUserNotFoundError()
    }

    await this.userRepository.delete(userId)
  }
}
