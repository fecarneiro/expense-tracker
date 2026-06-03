import { isUniqueViolation } from '../../database/db.error.js'
import type { Database } from '../../database/db.js'
import {
  type NewTelegram,
  type PublicTelegram,
  telegramTable,
} from '../../database/schemas/telegram.schema.js'
import { TelegramAccountAlreadyExistsError } from './telegram.error.js'

export class TelegramRepository {
  constructor(private readonly database: Database) {}

  async linkAccount(data: NewTelegram): Promise<PublicTelegram | null> {
    try {
      const [telegram] = await this.database
        .insert(telegramTable)
        .values(data)
        .returning({ id: telegramTable.id, createdAt: telegramTable.createdAt })

      return telegram ?? null
    } catch (err) {
      if (isUniqueViolation(err, 'unique_telegram_account_id')) {
        throw new TelegramAccountAlreadyExistsError()
      }
      throw err
    }
  }
}
