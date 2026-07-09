import { describe } from 'vitest'
import type { Database } from '../../database/db.js'
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

      const { code } = await container.connectionService.generateConnectionCode({
        userId: userA.id,
      })

      const connection = await container.connectionService.create({
        userId: userB.id,
        code: code,
      })

      expect(connection).toMatchObject({
        id: expect.any(String),
        userAId: userA.id,
        userBId: userB.id,
        createdAt: expect.any(Date),
      })
    })
  })
})
