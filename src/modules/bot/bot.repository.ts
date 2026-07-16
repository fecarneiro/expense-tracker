import { eq } from 'drizzle-orm'
import { isUniqueViolation } from '../../database/db.error.js'
import type { Database } from '../../database/db.js'
import { botAccountsTable, type NewBotAccount } from '../../database/schemas/bot-accounts.schema.js'
import { BotAccountAlreadyExistsError } from './bot.error.js'
import type { BotAccount, LinkBotAccountRepositoryInput } from './bot.types.js'

export class BotRepository {
  constructor(private readonly database: Database) {}

  async linkAccount(data: LinkBotAccountRepositoryInput): Promise<BotAccount | null> {
    const values: NewBotAccount = {
      userId: data.userId,
      telegramId: data.telegramId,
    }

    try {
      const [account] = await this.database.insert(botAccountsTable).values(values).returning()

      return account ?? null
    } catch (err) {
      if (isUniqueViolation(err, 'bot_accounts_telegramId_unique')) {
        throw new BotAccountAlreadyExistsError()
      }
      throw err
    }
  }

  async findAccountByTelegramId(telegramId: number): Promise<BotAccount | null> {
    const [user] = await this.database
      .select()
      .from(botAccountsTable)
      .where(eq(botAccountsTable.telegramId, telegramId))

    return user ?? null
  }

  async findAccountByUserId(userId: string): Promise<BotAccount | null> {
    const [account] = await this.database
      .select()
      .from(botAccountsTable)
      .where(eq(botAccountsTable.userId, userId))

    return account ?? null
  }
}
