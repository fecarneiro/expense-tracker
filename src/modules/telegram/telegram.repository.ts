import { eq } from 'drizzle-orm'
import { isUniqueViolation } from '../../database/db.error.js'
import type { Database } from '../../database/db.js'
import {
  type NewTelegram,
  type Telegram,
  telegramTable,
} from '../../database/schemas/telegram.schema.js'
import type { GetUserIdByTelegramIdData } from './http/telegram.http.dto.js'
import { TelegramAccountAlreadyExistsError } from './telegram.error.js'

export class TelegramRepository {
  constructor(private readonly database: Database) {}

  async linkAccount(data: NewTelegram): Promise<Telegram | null> {
    try {
      const [telegram] = await this.database.insert(telegramTable).values(data).returning()

      return telegram ?? null
    } catch (err) {
      if (isUniqueViolation(err, 'telegram_telegramId_unique')) {
        throw new TelegramAccountAlreadyExistsError()
      }
      throw err
    }
  }

  async findUserIdByTelegramId(
    data: GetUserIdByTelegramIdData,
  ): Promise<Pick<Telegram, 'userId'> | null> {
    const [user] = await this.database
      .select({ userId: telegramTable.userId })
      .from(telegramTable)
      .where(eq(telegramTable.telegramId, data.telegramId))

    return user ?? null
  }
}
