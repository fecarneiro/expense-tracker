import type { PasswordHasher } from '../../shared/password-hasher.js'
import { type PublicUser, toPublicUser } from '../users/user.entity.js'
import { InvalidCredentialsError } from '../users/user.error.js'
import type { UserRepository } from '../users/user.repository.js'
import type { LoginData } from './auth.schemas.js'

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async verifyUserCredentials(data: LoginData): Promise<PublicUser> {
    const { email, password } = data

    const user = await this.userRepository.findByEmail(email)

    if (!user) {
      throw new InvalidCredentialsError()
    }

    const validatedCredentials = await this.passwordHasher.compare(
      password,
      user.passwordHash,
    )

    if (!validatedCredentials) {
      throw new InvalidCredentialsError()
    }

    return toPublicUser(user)
  }
}
