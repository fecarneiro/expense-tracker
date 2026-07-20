import request from 'supertest'
import { describe, expect } from 'vitest'
import { createContainer } from '../../../../container.js'
import { createTestPartnership } from '../../../../tests/factories/partnership.factory.js'
import { httpTest as test } from '../../../../tests/fixtures/http.fixture.js'
import { SPLIT_TYPE } from '../shared-expense.types.js'

describe('POST /api/shared-expenses/batch', () => {
  test('returns 201 with all created shared expenses', async ({ app, db, authenticate }) => {
    const container = createContainer(db)
    const { inviter, sharedCategory } = await createTestPartnership(container, db, {
      withUserCategoryDefaults: true,
    })
    const { token } = await authenticate({ user: inviter })

    const response = await request(app)
      .post('/api/shared-expenses/batch')
      .set('Authorization', `Bearer ${token}`)
      .send({
        expenses: [
          {
            totalAmountCents: 1000,
            sharedCategoryId: sharedCategory.id,
            split: SPLIT_TYPE.HALF,
            description: 'Dinner',
          },
          {
            totalAmountCents: 2500,
            sharedCategoryId: sharedCategory.id,
            split: SPLIT_TYPE.FULL,
          },
        ],
      })
      .expect(201)

    expect(response.body).toEqual([
      expect.objectContaining({
        totalAmountCents: 1000,
        owedAmountCents: 500,
        description: 'Dinner',
      }),
      expect.objectContaining({
        totalAmountCents: 2500,
        owedAmountCents: 2500,
        description: null,
      }),
    ])
  })

  test('returns 400 for an empty batch', async ({ app, db, authenticate }) => {
    const container = createContainer(db)
    const { inviter } = await createTestPartnership(container, db)
    const { token } = await authenticate({ user: inviter })

    await request(app)
      .post('/api/shared-expenses/batch')
      .set('Authorization', `Bearer ${token}`)
      .send({ expenses: [] })
      .expect(400)
  })
})
