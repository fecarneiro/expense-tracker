import { describe } from 'vitest'
import { insertTestCategory } from '../../../tests/factories/category.factory.js'
import { createTestPartnership } from '../../../tests/factories/partnership.factory.js'
import { expect, integrationTest as test } from '../../../tests/fixtures/integration.fixture.js'

describe('SharedCategoryService', () => {
  test('mapUserCategoryToShared maps a user category to a shared category', async ({
    container,
    db,
  }) => {
    const { inviter, partnership, sharedCategory } = await createTestPartnership(container, db)

    const userCategory = await insertTestCategory(db, {
      userId: inviter.id,
      name: 'Restaurants',
    })

    const mapping = await container.sharedCategoryService.mapUserCategoryToShared({
      userId: inviter.id,
      partnershipId: partnership.id,
      userCategoryId: userCategory.id,
      sharedCategoryId: sharedCategory.id,
    })

    expect(mapping).toMatchObject({
      id: expect.any(String),
      userId: inviter.id,
      userCategoryId: userCategory.id,
      sharedCategoryId: sharedCategory.id,
      createdAt: expect.any(Date),
    })
  })
})
