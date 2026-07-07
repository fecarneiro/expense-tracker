import request from 'supertest'
import { describe, expect } from 'vitest'
import { httpTest as test } from '../../../tests/fixtures/http.fixture.js'
import { sendUnauthorized } from '../../../tests/helpers/http-request.helpers.js'
import {
  LINKING_CODE_MAX_NUMBER,
  LINKING_CODE_MIN_NUMBER,
} from '../linking-code/linking-code.service.js'

describe('authorization', () => {
  test.for([
    ['GET /telegram/generate-linking-code', 'get', '/telegram/generate-linking-code'],
  ] as const)('%s returns 401 without authorization header', async ([_route, method, path], {
    app,
  }) => {
    await sendUnauthorized(app, method, path).expect(401)
  })
})

describe('GET /telegram/generate-linking-code', () => {
  test('returns 201 with linking code', async ({ app, authenticate }) => {
    const { token } = await authenticate()

    const res = await request(app)
      .get('/telegram/generate-linking-code')
      .set('Authorization', `Bearer ${token}`)
      .expect(201)

    expect(res.body).toMatchObject({
      code: expect.any(Number),
      createdAt: expect.any(String),
    })
    expect(res.body.code).toBeGreaterThanOrEqual(LINKING_CODE_MIN_NUMBER)
    expect(res.body.code).toBeLessThan(LINKING_CODE_MAX_NUMBER)
  })
})
