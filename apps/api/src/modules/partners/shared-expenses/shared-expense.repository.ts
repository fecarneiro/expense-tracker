import { and, count, desc, eq, inArray, isNotNull, isNull } from 'drizzle-orm'
import type { Database, DatabaseClient } from '../../../database/db.js'
import { sharedCategoriesTable } from '../../../database/schemas/index.js'
import {
  type NewSharedExpenseRow,
  sharedExpensesTable,
} from '../../../database/schemas/partners/shared-expenses.schema.js'
import { SharedExpenseCreationError } from './shared-expense.errors.js'
import type { SharedExpense } from './shared-expense.types.js'

export type FindReportByPartnershipInput = {
  partnershipId: string
  limit: number
  offset: number
  payerUserId?: string | undefined
  owedUserId?: string | undefined
  settled?: boolean | undefined
}

export class SharedExpenseRepository {
  constructor(private readonly db: Database) {}

  async create(
    data: NewSharedExpenseRow,
    client: DatabaseClient = this.db,
  ): Promise<SharedExpense> {
    const [sharedExpense] = await client.insert(sharedExpensesTable).values(data).returning()

    if (!sharedExpense) {
      throw new SharedExpenseCreationError()
    }

    return sharedExpense
  }

  async findPendingByPartnership(
    partnershipId: string,
    client: DatabaseClient = this.db,
  ): Promise<SharedExpense[]> {
    return client
      .select()
      .from(sharedExpensesTable)
      .where(
        and(
          eq(sharedExpensesTable.partnershipId, partnershipId),
          isNull(sharedExpensesTable.settlementId),
        ),
      )
  }

  async markAsSettled(
    expenseIds: string[],
    settlementId: string,
    client: DatabaseClient = this.db,
  ): Promise<void> {
    if (expenseIds.length === 0) return

    await client
      .update(sharedExpensesTable)
      .set({ settlementId })
      .where(inArray(sharedExpensesTable.id, expenseIds))
  }

  // Front
  async findReportByPartnership(
    data: FindReportByPartnershipInput,
    client: DatabaseClient = this.db,
  ) {
    const conditions = [eq(sharedExpensesTable.partnershipId, data.partnershipId)]

    if (data.payerUserId) {
      conditions.push(eq(sharedExpensesTable.payerUserId, data.payerUserId))
    }
    if (data.owedUserId) {
      conditions.push(eq(sharedExpensesTable.owedUserId, data.owedUserId))
    }
    if (data.settled === false) {
      conditions.push(isNull(sharedExpensesTable.settlementId))
    }
    if (data.settled === true) {
      conditions.push(isNotNull(sharedExpensesTable.settlementId))
    }

    const where = and(...conditions)

    const [countRow] = await client
      .select({ total: count().mapWith(Number) })
      .from(sharedExpensesTable)
      .where(where)

    const rows = await client
      .select({
        id: sharedExpensesTable.id,
        occurredAt: sharedExpensesTable.occurredAt,
        payerUserId: sharedExpensesTable.payerUserId,
        owedUserId: sharedExpensesTable.owedUserId,
        totalAmountCents: sharedExpensesTable.totalAmountCents,
        owedAmountCents: sharedExpensesTable.owedAmountCents,
        description: sharedExpensesTable.description,
        settlementId: sharedExpensesTable.settlementId,

        categoryName: sharedCategoriesTable.name,
      })
      .from(sharedExpensesTable)
      .innerJoin(
        sharedCategoriesTable,
        eq(sharedExpensesTable.sharedCategoryId, sharedCategoriesTable.id),
      )
      .where(where)
      .orderBy(desc(sharedExpensesTable.occurredAt))
      .limit(data.limit)
      .offset(data.offset)

    return {
      rows,
      total: countRow?.total ?? 0,
    }
  }
}
