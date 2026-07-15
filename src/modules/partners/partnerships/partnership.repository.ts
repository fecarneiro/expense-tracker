import { and, eq, isNull, or } from 'drizzle-orm/sql'
import type { Database, DatabaseClient } from '../../../database/db.js'
import {
  type NewPartnershipRow,
  type PartnershipRow,
  partnershipsTable,
} from '../../../database/schemas/partners/partnerships.schema.js'
import { PartnershipCreationError } from './partnership.errors.js'
import type { Partnership } from './partnership.types.js'

export class PartnershipRepository {
  constructor(private readonly db: Database) {}

  async createPartnership(
    data: NewPartnershipRow,
    client: DatabaseClient = this.db,
  ): Promise<Partnership> {
    const [partnership] = await client.insert(partnershipsTable).values(data).returning()

    if (!partnership) {
      throw new PartnershipCreationError()
    }

    return partnership
  }

  async findUserActivePartnership(
    userId: string,
    client: DatabaseClient = this.db,
  ): Promise<PartnershipRow | null> {
    const [partnership] = await client
      .select()
      .from(partnershipsTable)
      .where(
        and(
          isNull(partnershipsTable.endedAt),
          or(eq(partnershipsTable.userAId, userId), eq(partnershipsTable.userBId, userId)),
        ),
      )

    return partnership ?? null
  }
}
