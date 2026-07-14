import { eq } from 'drizzle-orm'
import { describe } from 'vitest'
import { sharedCategoriesTable } from '../../database/schemas/partnerships.schema.js'
import { insertOtherTestUser, insertTestUser } from '../../tests/factories/user.factory.js'
import { expect, integrationTest as test } from '../../tests/fixtures/integration.fixture.js'
import { LinkingCodeRepository } from '../linking-codes/linking-code.repository.js'
import { LinkingCodeService } from '../linking-codes/linking-code.service.js'
import { SHARED_CATEGORY_DEFAULTS } from './partnership.defaults.js'

describe('PartnershipService', () => {
  test('createPartnership creates partnership and default shared categories', async ({
    container,
    db,
  }) => {
    const inviter = await insertTestUser(db)
    const invitee = await insertOtherTestUser(db)
    const linkingCodeService = new LinkingCodeService(new LinkingCodeRepository(db))
    const service = container.partnershipService

    const { code } = await linkingCodeService.create({
      userId: inviter.id,
      purpose: 'partnership_link',
    })

    const partnership = await service.createPartnership({
      inviteeId: invitee.id,
      code,
    })

    const [userAId, userBId] =
      inviter.id < invitee.id ? [inviter.id, invitee.id] : [invitee.id, inviter.id]

    const sharedCategories = await db
      .select()
      .from(sharedCategoriesTable)
      .where(eq(sharedCategoriesTable.partnershipId, partnership.id))

    expect(partnership).toMatchObject({
      id: expect.any(String),
      userAId,
      userBId,
      endedAt: null,
      createdAt: expect.any(Date),
    })

    expect(sharedCategories).toHaveLength(SHARED_CATEGORY_DEFAULTS.length)
  })
})
