import type { Database } from '../../database/db.js'
import {
  connectionsTable,
  type NewConnectionRow,
} from '../../database/schemas/connections.schema.js'
import type { Connection } from './connections.service.js'

export class ConnectionsRepository {
  constructor(private readonly database: Database) {}

  async create(data: NewConnectionRow): Promise<Connection | null> {
    const [connection] = await this.database.insert(connectionsTable).values(data).returning()

    return connection ?? null
  }
}
