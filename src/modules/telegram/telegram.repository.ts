import { eq } from 'drizzle-orm'
import { isUniqueViolation } from '../../database/db.error.js'
import type { Database } from '../../database/db.js'
import { type NewTelegram, telegramTable } from '../../database/schemas/telegram.schema.js'
import { TelegramAccountAlreadyExistsError } from './telegram.error.js'
import type {
  FindAccountByTelegramIdInput,
  LinkTelegramAccountRepositoryInput,
  TelegramAccount,
} from './telegram.types.js'

export class TelegramRepository {
  constructor(private readonly database: Database) {}

  async linkAccount(data: LinkTelegramAccountRepositoryInput): Promise<TelegramAccount | null> {
    const values: NewTelegram = {
      userId: data.userId,
      telegramId: data.telegramId,
    }

    try {
      const [telegram] = await this.database.insert(telegramTable).values(values).returning()

      return telegram ?? null
    } catch (err) {
      if (isUniqueViolation(err, 'telegram_telegramId_unique')) {
        throw new TelegramAccountAlreadyExistsError()
      }
      throw err
    }
  }

  async findAccountByTelegramId(
    data: FindAccountByTelegramIdInput,
  ): Promise<TelegramAccount | null> {
    const [user] = await this.database
      .select()
      .from(telegramTable)
      .where(eq(telegramTable.telegramId, data.telegramId))

    return user ?? null
  }
}
