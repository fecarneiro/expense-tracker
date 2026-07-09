import { describe } from 'vitest'
import type { Database } from '../../database/db.js'
import { UNKNOWN_UUID } from '../../tests/constants.js'
import { insertTestUser } from '../../tests/factories/user.factory.js'
import { expect, integrationTest as test } from '../../tests/fixtures/integration.fixture.js'

async function createUsers(db: Database) {
  const [userA, userB] = await Promise.all([
    insertTestUser(db, { email: 'user_a@test.com' }),
    insertTestUser(db, { email: 'user_b@test.com' }),
  ])
  return { userA, userB }
}

describe('ConnectionsService', () => {
  describe('create', () => {
    test('creates a connection', async ({ container, db }) => {
      const { userA, userB } = await createUsers(db)

      const connection = await container.connectionService.create({
        userAId: userA.id,
        userBId: userB.id,
        status: 'pending',
        connectionId: UNKNOWN_UUID,
      })

      expect(connection).toMatchObject({
        userAId: userA.id,
        userBId: userB.id,
        status: 'pending',
        connectionId: expect.any(String),
        createdAt: expect.any(Date),
      })
    })
  })
})
