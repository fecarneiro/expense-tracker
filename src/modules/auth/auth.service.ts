import type { UserService } from '../users/user.service.js'
import type { PublicUser } from '../users/user.types.js'
import { InvalidCredentialsError } from './auth.error.js'
import type { LoginInput, RegisterInput } from './auth.types.js'

export class AuthService {
  constructor(private readonly userService: UserService) {}

  async register(data: RegisterInput): Promise<PublicUser> {
    return this.userService.createWithPassword(data)
  }

  async verifyCredentials(data: LoginInput): Promise<PublicUser> {
    const user = await this.userService.verifyPassword(data)

    if (!user) {
      throw new InvalidCredentialsError()
    }

    return user
  }
}
