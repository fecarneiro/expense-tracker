import type { PasswordHasher } from '../../shared/password-hasher.js'
import { InvalidCredentialsError } from '../users/user.error.js'
import type { UserRepository } from '../users/user.repository.js'
import type { AuthResponse, SignInCredentials } from './auth.dto.js'

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async verifyUserCredentials(data: SignInCredentials): Promise<AuthResponse> {
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
}
