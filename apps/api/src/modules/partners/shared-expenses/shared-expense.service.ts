import type { SharedExpenseReportItem } from '@expense-tracker/contracts'
import type { Database } from '../../../database/db.js'
import { CATEGORY_SYSTEM_KEY } from '../../categories/category.defaults.js'
import { CategoryNotFoundError } from '../../categories/category.error.js'
import type { CategoryRepository } from '../../categories/category.repository.js'
import type { Category } from '../../categories/category.types.js'
import type { TransactionRepository } from '../../transactions/transaction.repository.js'
import type { PartnershipRepository } from '../partnerships/partnership.repository.js'

import { partnerOf } from '../partnerships/partnership.utils.js'
import { SharedCategoryNotFoundError } from '../shared-categories/shared-category.errors.js'
import type { SharedCategoryRepository } from '../shared-categories/shared-category.repository.js'
import { ActivePartnershipNotFoundError } from './shared-expense.errors.js'
import type { SharedExpenseRepository } from './shared-expense.repository.js'
import { type SharedExpense, SPLIT_TYPE, type SplitType } from './shared-expense.types.js'
import { resolveSplitAmounts } from './shared-expense.utils.js'

export type CreateSharedExpense = {
  userId: string
  totalAmountCents: number
  sharedCategoryId: string
  split: SplitType
  description?: string | null
}

export class SharedExpenseService {
  constructor(
    private readonly sharedExpenseRepository: SharedExpenseRepository,
    private readonly partnershipRepository: PartnershipRepository,
    private readonly sharedCategoryRepository: SharedCategoryRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly db: Database,
  ) {}

  // TODO: partnership will be validated from middleware
  async create(input: CreateSharedExpense): Promise<SharedExpense> {
    const { userId, sharedCategoryId, totalAmountCents, split, description = null } = input

    const partnership = await this.partnershipRepository.findUserActivePartnership(userId)
    if (!partnership) throw new ActivePartnershipNotFoundError()

    const sharedCategory = await this.sharedCategoryRepository.findSharedCategory({
      partnershipId: partnership.id,
      sharedCategoryId,
    })
    if (!sharedCategory) throw new SharedCategoryNotFoundError()

    const partnerId = partnerOf(partnership, userId)
    const { payerAmountCents, owedAmountCents } = resolveSplitAmounts(totalAmountCents, split)
    const userCategory = await this.resolveMappedCategory(userId, sharedCategoryId)
    const partnerCategory = await this.resolveMappedCategory(partnerId, sharedCategoryId)
    const occurredAt = new Date()

    return await this.db.transaction(async (tx) => {
      const sharedExpense = await this.sharedExpenseRepository.create(
        {
          partnershipId: partnership.id,
          sharedCategoryId,
          payerUserId: userId,
          owedUserId: partnerId,
          totalAmountCents,
          owedAmountCents,
          settlementId: null,
          description,
        },
        tx,
      )

      if (split === SPLIT_TYPE.FULL) {
        await this.transactionRepository.create(
          {
            userId: partnerId,
            amountCents: owedAmountCents,
            categoryId: partnerCategory.id,
            createdByUserId: userId,
            transactionType: partnerCategory.categoryType,
            occurredAt,
            description,
          },
          tx,
        )
      }

      if (split === SPLIT_TYPE.HALF) {
        await this.transactionRepository.create(
          {
            userId,
            amountCents: payerAmountCents,
            categoryId: userCategory.id,
            createdByUserId: userId,
            transactionType: userCategory.categoryType,
            occurredAt,
            description,
          },
          tx,
        )
        await this.transactionRepository.create(
          {
            userId: partnerId,
            amountCents: owedAmountCents,
            categoryId: partnerCategory.id,
            createdByUserId: userId,
            transactionType: partnerCategory.categoryType,
            occurredAt,
            description,
          },
          tx,
        )
      }

      return sharedExpense
    })
  }
  async listReport(partnershipId: string): Promise<SharedExpenseReportItem[]> {
    const rows = await this.sharedExpenseRepository.findReportByPartnership(partnershipId)

    return rows.map((row) => ({
      id: row.id,
      occurredAt: row.occurredAt.toISOString(),

      payerUserId: row.payerUserId,
      owedUserId: row.owedUserId,

      totalAmountCents: row.totalAmountCents,
      owedAmountCents: row.owedAmountCents,

      categoryName: row.categoryName,
      description: row.description,

      status: row.settlementId ? 'settled' : 'pending',
    }))
  }

  private async resolveMappedCategory(userId: string, sharedCategoryId: string): Promise<Category> {
    const mapped = await this.sharedCategoryRepository.findUserMappedCategory(
      userId,
      sharedCategoryId,
    )

    if (mapped) {
      const category = await this.categoryRepository.findById({
        id: mapped.userCategoryId,
        userId,
      })
      if (!category) throw new CategoryNotFoundError()
      return category
    }

    const uncategorized = await this.categoryRepository.findBySystemKey({
      userId,
      systemKey: CATEGORY_SYSTEM_KEY.UNCATEGORIZED,
    })
    if (!uncategorized) throw new CategoryNotFoundError()
    return uncategorized
  }
}
