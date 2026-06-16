import type { UserService } from '../users/user.service.js'
import type { PublicUser } from '../users/user.types.js'
import type { LoginData, RegisterUserData } from './auth.dto.js'
import { InvalidCredentialsError } from './auth.error.js'

export class AuthService {
  constructor(private readonly userService: UserService) {}

  async register(data: RegisterUserData): Promise<PublicUser> {
    return this.userService.createWithPassword(data)
  }

  async verifyCredentials(data: LoginData): Promise<PublicUser> {
    const user = await this.userService.verifyPassword(data)

    if (!user) {
      throw new InvalidCredentialsError()
    }

    return user
  }
}
