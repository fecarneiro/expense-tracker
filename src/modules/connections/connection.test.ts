import { describe } from 'vitest'
import type { Database } from '../../database/db.js'
import { insertTestUser } from '../../tests/factories/user.factory.js'
import { expect, integrationTest as test } from '../../tests/fixtures/integration.fixture.js'
import { defaultSharedCategories } from '../shared_categories/shared_category.defaults.js'
import { ConnectionCreationError } from './connection.error.js'

async function createUsers(db: Database) {
  const [userA, userB] = await Promise.all([
    insertTestUser(db, { email: 'user_a@test.com' }),
    insertTestUser(db, { email: 'user_b@test.com' }),
  ])
  return { userA, userB }
}

describe('ConnectionsService', () => {
  describe('create', () => {
    test('creates a connection with default shared categories', async ({ container, db }) => {
      const { userA, userB } = await createUsers(db)

      const { code } = await container.connectionService.generateConnectionCode({
        userId: userA.id,
      })

      const connection = await container.connectionService.create({
        userId: userB.id,
        code,
      })

      if (!connection) {
        throw new ConnectionCreationError()
      }

      const sharedCategories = await container.sharedCategoryService.findManyByConnectionId({
        connectionId: connection.id,
      })

      expect(connection).toMatchObject({
        id: expect.any(String),
        userAId: userA.id,
        userBId: userB.id,
        createdAt: expect.any(Date),
      })

      expect(sharedCategories).toHaveLength(defaultSharedCategories.length)

      expect(sharedCategories).toEqual(
        expect.arrayContaining(
          defaultSharedCategories.map((category) =>
            expect.objectContaining({
              connectionId: connection.id,
              name: category.name,
            }),
          ),
        ),
      )
    })
  })
})
