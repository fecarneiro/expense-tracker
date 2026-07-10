import { describe } from 'vitest'
import type { Database } from '../../database/db.js'
import { insertTestUser } from '../../tests/factories/user.factory.js'
import { expect, integrationTest as test } from '../../tests/fixtures/integration.fixture.js'
import { defaultPartnershipCategories } from '../partnership-categories/partnership-category.defaults.js'
import { PartnershipCreationError } from './partnership.error.js'

async function createUsers(db: Database) {
  const [userA, userB] = await Promise.all([
    insertTestUser(db, { email: 'user_a@test.com' }),
    insertTestUser(db, { email: 'user_b@test.com' }),
  ])
  return { userA, userB }
}

describe('PartnershipService', () => {
  describe('create', () => {
    test('creates a partnership with default partnership categories', async ({ container, db }) => {
      const { userA, userB } = await createUsers(db)

      const { code } = await container.partnershipService.generatePartnershipCode({
        userId: userA.id,
      })

      const partnership = await container.partnershipService.create({
        userId: userB.id,
        code,
      })

      if (!partnership) {
        throw new PartnershipCreationError()
      }

      const partnershipCategories =
        await container.partnershipCategoryService.findManyByPartnershipId({
          partnershipId: partnership.id,
        })

      expect(partnership).toMatchObject({
        id: expect.any(String),
        userAId: userA.id,
        userBId: userB.id,
        createdAt: expect.any(Date),
      })

      expect(partnershipCategories).toHaveLength(defaultPartnershipCategories.length)

      expect(partnershipCategories).toEqual(
        expect.arrayContaining(
          defaultPartnershipCategories.map((category) =>
            expect.objectContaining({
              partnershipId: partnership.id,
              name: category.name,
            }),
          ),
        ),
      )
    })
  })
})
