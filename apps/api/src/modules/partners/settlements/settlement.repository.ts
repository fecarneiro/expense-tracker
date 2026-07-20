import type { Database, DatabaseClient } from '../../../database/db.js'
import {
  type NewSettlementRow,
  settlementsTable,
} from '../../../database/schemas/partners/settlements.schema.js'
import { SettlementCreationError } from './settlement.errors.js'
import type { Settlement } from './settlement.types.js'

export class SettlementRepository {
  constructor(private readonly db: Database) {}

  async create(data: NewSettlementRow, client: DatabaseClient = this.db): Promise<Settlement> {
    const [settlement] = await client.insert(settlementsTable).values(data).returning()

    if (!settlement) {
      throw new SettlementCreationError()
    }

    return settlement
  }
}
