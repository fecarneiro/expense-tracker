import {
  type PublicUser,
  toPublicUser,
} from '../../database/schemas/user.schema.js'
import type { PasswordHasher } from '../../shared/password-hasher.js'
import {
  EmailAlreadyInUseError,
  InvalidCredentialsError,
  UserCreationFailedError,
} from '../users/user.error.js'
import type { UserRepository } from '../users/user.repository.js'
import type { LoginData, RegisterUserData } from './auth.dto.js'

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async register(data: RegisterUserData): Promise<PublicUser> {
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

  async verifyCredentials(data: LoginData): Promise<PublicUser> {
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
