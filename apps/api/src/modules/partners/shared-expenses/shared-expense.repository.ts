import { and, desc, eq, inArray, isNull } from 'drizzle-orm'
import type { Database, DatabaseClient } from '../../../database/db.js'
import { sharedCategoriesTable } from '../../../database/schemas/index.js'
import {
  type NewSharedExpenseRow,
  sharedExpensesTable,
} from '../../../database/schemas/partners/shared-expenses.schema.js'
import { SharedExpenseCreationError } from './shared-expense.errors.js'
import type { SharedExpense } from './shared-expense.types.js'

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
  async findReportByPartnership(partnershipId: string, client: DatabaseClient = this.db) {
    return client
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
      .where(eq(sharedExpensesTable.partnershipId, partnershipId))
      .orderBy(desc(sharedExpensesTable.occurredAt))
  }
}
