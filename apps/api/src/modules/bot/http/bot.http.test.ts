import request from 'supertest'
import { describe, expect } from 'vitest'
import { httpTest as test } from '../../../tests/fixtures/http.fixture.js'
import { sendUnauthorized } from '../../../tests/helpers/http-request.helpers.js'
import { LINKING_CODE } from '../../linking-codes/linking-code.constants.js'

describe('authorization', () => {
  test('GET /api/bot/generate-linking-code returns 401 without authorization header', async ({
    app,
  }) => {
    await sendUnauthorized(app, 'get', '/api/bot/generate-linking-code').expect(401)
  })
})

describe('GET /api/bot/generate-linking-code', () => {
  test('returns 201 with linking code', async ({ app, authenticate }) => {
    const { token } = await authenticate()

    const res = await request(app)
      .get('/api/bot/generate-linking-code')
      .set('Authorization', `Bearer ${token}`)
      .expect(201)

    expect(res.body).toMatchObject({
      code: expect.any(Number),
      createdAt: expect.any(String),
    })
    expect(res.body.code).toBeGreaterThanOrEqual(LINKING_CODE.MIN_NUMBER)
    expect(res.body.code).toBeLessThan(LINKING_CODE.MAX_NUMBER)
  })
})
