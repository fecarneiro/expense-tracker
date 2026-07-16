import { eq } from 'drizzle-orm'
import type { createContainer } from '../../container.js'
import type { Database } from '../../database/db.js'
import { sharedCategoriesTable } from '../../database/schemas/partners/shared-categories.schema.js'
import { LINKING_CODE_PURPOSE } from '../../modules/linking-codes/linking-code.constants.js'
import { LinkingCodeRepository } from '../../modules/linking-codes/linking-code.repository.js'
import { LinkingCodeService } from '../../modules/linking-codes/linking-code.service.js'
import { insertOtherTestUser, insertTestUser } from './user.factory.js'

type Container = ReturnType<typeof createContainer>

type CreateTestPartnershipOptions = {
  withUserCategoryDefaults?: boolean
}

export async function createTestPartnership(
  container: Container,
  db: Database,
  options: CreateTestPartnershipOptions = {},
) {
  const inviter = await insertTestUser(db)
  const invitee = await insertOtherTestUser(db)

  if (options.withUserCategoryDefaults) {
    await container.categoryService.createDefaultsForUser(inviter.id)
    await container.categoryService.createDefaultsForUser(invitee.id)
  }

  const linkingCodeService = new LinkingCodeService(new LinkingCodeRepository(db))
  const { code } = await linkingCodeService.create({
    userId: inviter.id,
    purpose: LINKING_CODE_PURPOSE.PARTNERSHIP_LINK,
  })

  const partnership = await container.partnershipService.createPartnership({
    inviteeId: invitee.id,
    code,
  })

  const sharedCategories = await db
    .select()
    .from(sharedCategoriesTable)
    .where(eq(sharedCategoriesTable.partnershipId, partnership.id))

  const sharedCategory = sharedCategories[0]
  if (!sharedCategory) throw new Error('createTestPartnership: expected default shared category')

  return {
    inviter,
    invitee,
    partnership,
    sharedCategories,
    sharedCategory,
  }
}
