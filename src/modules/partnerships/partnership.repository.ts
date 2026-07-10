import type { Database } from '../../database/db.js'
import {
  type NewPartnershipRow,
  partnershipsTable,
} from '../../database/schemas/partnerships.schema.js'
import type { Partnership } from './partnership.service.js'

export class PartnershipRepository {
  constructor(private readonly database: Database) {}

  async create(data: NewPartnershipRow): Promise<Partnership | null> {
    const [partnership] = await this.database.insert(partnershipsTable).values(data).returning()

    return partnership ?? null
  }
}
