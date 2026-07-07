import { eq } from 'drizzle-orm'
import { isUniqueViolation } from '../../database/db.error.js'
import type { Database, DatabaseClient } from '../../database/db.js'
import { type NewUserRow, usersTable } from '../../database/schemas/user.schema.js'
import { EmailAlreadyInUseError, UserCreationFailedError } from './user.error.js'
import type {
  DeletedUser,
  FindUserByEmailInput,
  FindUserByIdInput,
  UpdatePasswordInput,
  User,
} from './user.types.js'

export class UserRepository {
  constructor(private readonly database: Database) {}

  async create(data: NewUserRow, dbClient: DatabaseClient = this.database): Promise<User> {
    try {
      const [user] = await dbClient.insert(usersTable).values(data).returning()

      if (!user) {
        throw new UserCreationFailedError()
      }

      return user
    } catch (err) {
      if (isUniqueViolation(err, 'users_email_unique')) {
        throw new EmailAlreadyInUseError()
      }
      throw err
    }
  }

  async findById(data: FindUserByIdInput): Promise<User | null> {
    const [user] = await this.database.select().from(usersTable).where(eq(usersTable.id, data.id))

    return user ?? null
  }

  async findByEmail(data: FindUserByEmailInput): Promise<User | null> {
    const [user] = await this.database
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, data.email))

    return user ?? null
  }

  async updatePassword(data: UpdatePasswordInput): Promise<User | null> {
    const [user] = await this.database
      .update(usersTable)
      .set({ passwordHash: data.passwordHash })
      .where(eq(usersTable.id, data.id))
      .returning()

    return user ?? null
  }

  async delete(data: DeletedUser): Promise<DeletedUser | null> {
    const [user] = await this.database
      .delete(usersTable)
      .where(eq(usersTable.id, data.id))
      .returning({ id: usersTable.id })

    return user ?? null
  }
}
