import { type PublicUser, toPublicUser } from '../../database/schemas/user.schema.js'
import type { PasswordHasher } from '../../shared/password-hasher.js'
import { InvalidCredentialsError } from '../auth/auth.error.js'
import type { ChangePasswordData, DeleteUserData } from './user.dto.js'
import { AuthenticatedUserNotFoundError } from './user.error.js'
import type { UserRepository } from './user.repository.js'

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async getProfile(userId: string): Promise<PublicUser> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new AuthenticatedUserNotFoundError()
    }
    return toPublicUser(user)
  }

  async changePassword(data: ChangePasswordData): Promise<void> {
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

  async delete(data: DeleteUserData): Promise<void> {
    const user = await this.userRepository.findById(data.userId)

    if (!user) {
      throw new AuthenticatedUserNotFoundError()
    }

    const validCredentials = await this.passwordHasher.compare(data.password, user.passwordHash)

    if (!validCredentials) {
      throw new InvalidCredentialsError()
    }

    await this.userRepository.delete({ userId: data.userId })
  }
}
