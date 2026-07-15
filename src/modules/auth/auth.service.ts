import type { Database } from '../../database/db.js'
import type { CategoryService } from '../categories/category.service.js'
import type { UserResponse } from '../users/user.mapper.js'
import type { UserService } from '../users/user.service.js'
import { InvalidCredentialsError } from './auth.error.js'
import type { LoginInput, RegisterInput } from './auth.types.js'

export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly categoryService: CategoryService,
    private readonly database: Database,
  ) {}

  async register(data: RegisterInput): Promise<UserResponse> {
    return await this.database.transaction(async (tx) => {
      const user = await this.userService.createWithPassword(data, tx)
      await this.categoryService.createDefaultsForUser(user.id, tx)

      return user
    })
  }

  async verifyCredentials(data: LoginInput): Promise<UserResponse> {
    const user = await this.userService.verifyPassword(data)

    if (!user) {
      throw new InvalidCredentialsError()
    }

    return user
  }
}
