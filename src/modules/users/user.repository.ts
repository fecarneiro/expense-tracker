import { eq } from 'drizzle-orm'
import type { Database } from '../../database/db.js'
import { type NewUser, type User, usersTable } from './user.entity.js'
import type {
  DeleteRepositoryData,
  UpdatePasswordRepositoryData,
} from './user.schemas.js'

export class UserRepository {
  constructor(private readonly database: Database) {}

  async create(data: NewUser): Promise<User | null> {
    const [user] = await this.database
      .insert(usersTable)
      .values(data)
      .returning()

    return user ?? null
  }

  async findById(id: string): Promise<User | null> {
    const [user] = await this.database
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))

    return user ?? null
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await this.database
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))

    return user ?? null
  }

  async updatePassword(
    data: UpdatePasswordRepositoryData,
  ): Promise<User | null> {
    const [user] = await this.database
      .update(usersTable)
      .set({ passwordHash: data.passwordHash })
      .where(eq(usersTable.id, data.userId))
      .returning()

    return user ?? null
  }

  async delete(data: DeleteRepositoryData) {
    await this.database.delete(usersTable).where(eq(usersTable.id, data.userId))
  }
}
