import request from 'supertest'
import { describe, expect } from 'vitest'
import { UNKNOWN_UUID } from '../../../tests/constants.js'
import { httpTest as test } from '../../../tests/fixtures/http.fixture.js'
import { type HttpTestApp, sendUnauthorized } from '../../../tests/helpers/http-request.helpers.js'
import type { CreateCategoryBodyInput, UpdateCategoryBodyInput } from '../category.schemas.js'

const DEFAULT_HTTP_CREATE = {
  name: 'New Category',
  categoryType: 'expense',
} as const satisfies CreateCategoryBodyInput

function validCreateBody(overrides?: Partial<CreateCategoryBodyInput>): CreateCategoryBodyInput {
  return { ...DEFAULT_HTTP_CREATE, ...overrides }
}

async function postCategory(
  app: HttpTestApp,
  token: string,
  overrides?: Partial<CreateCategoryBodyInput>,
) {
  const res = await request(app)
    .post('/categories')
    .set('Authorization', `Bearer ${token}`)
    .send(validCreateBody(overrides))
    .expect(201)

  return res.body as { id: string; name: string; categoryType: string }
}

describe('authorization', () => {
  test.for([
    ['POST /categories', 'post', '/categories', DEFAULT_HTTP_CREATE],
    ['GET /categories', 'get', '/categories'],
    ['GET /categories/:id', 'get', `/categories/${UNKNOWN_UUID}`],
    ['PATCH /categories/:id', 'patch', `/categories/${UNKNOWN_UUID}`, DEFAULT_HTTP_CREATE],
    ['DELETE /categories/:id', 'delete', `/categories/${UNKNOWN_UUID}`],
  ] as const)('%s returns 401 without authorization header', async ([_route, method, path, body], {
    app,
  }) => {
    await sendUnauthorized(app, method, path, body).expect(401)
  })
})

describe('POST /categories', () => {
  test('returns 201 with created category', async ({ app, authenticate }) => {
    const { token } = await authenticate()

    const res = await request(app)
      .post('/categories')
      .set('Authorization', `Bearer ${token}`)
      .send(validCreateBody())
      .expect(201)

    expect(res.body).toMatchObject({
      id: expect.any(String),
      name: DEFAULT_HTTP_CREATE.name,
      categoryType: DEFAULT_HTTP_CREATE.categoryType,
    })
  })

  test.for([
    ['empty name', { name: '', categoryType: 'expense' }],
    ['name longer than 50', { name: 'a'.repeat(51), categoryType: 'expense' }],
    ['missing categoryType', { name: 'Food' }],
    ['invalid categoryType', { name: 'Food', categoryType: 'invalid' }],
    ['extra field (strictObject)', { ...validCreateBody(), hacker: true }],
  ])('returns 400 when %s', async ([_label, body], { app, authenticate }) => {
    const { token } = await authenticate()

    await request(app)
      .post('/categories')
      .set('Authorization', `Bearer ${token}`)
      .send(body)
      .expect(400)
  })
})

describe('GET /categories', () => {
  test('returns 200 with an empty list', async ({ app, authenticate }) => {
    const { token } = await authenticate()

    const res = await request(app)
      .get('/categories')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(res.body).toEqual([])
  })

  test('returns 400 with invalid query params', async ({ app, authenticate }) => {
    const { token } = await authenticate()

    await request(app)
      .get('/categories?categoryType=invalid')
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
  })
})

describe('GET /categories/:id', () => {
  test('returns 400 with invalid id', async ({ app, authenticate }) => {
    const { token } = await authenticate()

    await request(app)
      .get('/categories/invalid-uuid')
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
  })
})

describe('PATCH /categories/:id', () => {
  test('returns 200 with updated category', async ({ app, authenticate }) => {
    const { token } = await authenticate()
    const { id } = await postCategory(app, token)

    const res = await request(app)
      .patch(`/categories/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated', categoryType: 'income' } satisfies UpdateCategoryBodyInput)
      .expect(200)

    expect(res.body).toMatchObject({
      id,
      name: 'Updated',
      categoryType: 'income',
    })
  })

  test('returns 400 with invalid id', async ({ app, authenticate }) => {
    const { token } = await authenticate()

    await request(app)
      .patch('/categories/invalid-uuid')
      .set('Authorization', `Bearer ${token}`)
      .send(validCreateBody())
      .expect(400)
  })

  test.for([
    ['empty name', { name: '', categoryType: 'expense' }],
    ['name longer than 50', { name: 'a'.repeat(51), categoryType: 'expense' }],
    ['missing categoryType', { name: 'Food' }],
  ])('returns 400 when %s', async ([_label, body], { app, authenticate }) => {
    const { token } = await authenticate()
    const { id } = await postCategory(app, token)

    await request(app)
      .patch(`/categories/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(body)
      .expect(400)
  })
})

describe('DELETE /categories/:id', () => {
  test('returns 204 when category is deleted', async ({ app, authenticate }) => {
    const { token } = await authenticate()
    const { id } = await postCategory(app, token)

    await request(app)
      .delete(`/categories/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
  })

  test('returns 400 with invalid id', async ({ app, authenticate }) => {
    const { token } = await authenticate()

    await request(app)
      .delete('/categories/invalid-uuid')
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
  })
})
