import type { PasswordHasher } from '../../shared/password-hasher.js'
import { type PublicUser, toPublicUser } from './user.entity.js'
import {
  AuthenticatedUserNotFoundError,
  EmailAlreadyInUseError,
  InvalidCredentialsError,
  UserCreationFailedError,
} from './user.error.js'
import type { UserRepository } from './user.repository.js'
import type {
  ChangePasswordData,
  CreateUserData,
  DeleteUserData,
} from './user.schemas.js'

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async createNewUser(data: CreateUserData): Promise<PublicUser> {
    const { email, password } = data

    const existingUser = await this.userRepository.findByEmail(email)

    if (existingUser) {
      throw new EmailAlreadyInUseError()
    }

    const passwordHash = await this.passwordHasher.hash(password)

    const createdUser = await this.userRepository.create({
      email,
      passwordHash,
    })

    if (!createdUser) {
      throw new UserCreationFailedError()
    }

    return toPublicUser(createdUser)
  }

  async changeUserPassword(data: ChangePasswordData): Promise<void> {
    const user = await this.userRepository.findById(data.userId)

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
      userId: user.id,
      passwordHash: newPasswordHashed,
    })
  }

  async deleteUser(data: DeleteUserData): Promise<void> {
    const user = await this.userRepository.findById(data.userId)

    if (!user) {
      throw new AuthenticatedUserNotFoundError()
    }

    await this.userRepository.delete({ userId: data.userId })
  }
}
