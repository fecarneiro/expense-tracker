import request from 'supertest'
import { describe, expect } from 'vitest'
import {
  TEST_OCCURRED_AT,
  TEST_OCCURRED_AT_LATER,
  TEST_OCCURRED_AT_RESPONSE,
  UNKNOWN_UUID,
} from '../../../tests/constants.js'
import {
  DEFAULT_CATEGORY_NAME,
  insertTestCategory,
} from '../../../tests/factories/category.factory.js'
import { httpTest as test } from '../../../tests/fixtures/http.fixture.js'
import { type HttpTestApp, sendUnauthorized } from '../../../tests/helpers/http-request.helpers.js'
import type { CreateTransactionBodyInput } from '../transaction.schemas.js'

const DEFAULT_HTTP_CREATE = {
  occurredAt: TEST_OCCURRED_AT,
  amountCents: 1000,
  description: 'my description',
} as const satisfies Omit<CreateTransactionBodyInput, 'categoryId'>

function validCreateBody(categoryId: string): CreateTransactionBodyInput {
  return { ...DEFAULT_HTTP_CREATE, categoryId }
}

async function postTransaction(app: HttpTestApp, token: string, categoryId: string) {
  const res = await request(app)
    .post('/api/transactions')
    .set('Authorization', `Bearer ${token}`)
    .send(validCreateBody(categoryId))
    .expect(201)

  return res.body as { id: string }
}

describe('authorization', () => {
  test.for([
    ['POST /api/transactions', 'post', '/api/transactions', validCreateBody(UNKNOWN_UUID)],
    ['GET /api/transactions', 'get', '/api/transactions'],
    ['GET /api/transactions/:id', 'get', `/api/transactions/${UNKNOWN_UUID}`],
    [
      'PATCH /api/transactions/:id',
      'patch',
      `/api/transactions/${UNKNOWN_UUID}`,
      { amountCents: 100 },
    ],
    ['DELETE /api/transactions/:id', 'delete', `/api/transactions/${UNKNOWN_UUID}`],
    ['GET /api/transactions/monthly-balance', 'get', '/api/transactions/monthly-balance'],
    ['GET /api/transactions/category-totals', 'get', '/api/transactions/category-totals'],
  ] as const)(
    '%s returns 401 without authorization header',
    async ([_route, method, path, body], { app }) => {
      await sendUnauthorized(app, method, path, body).expect(401)
    },
  )
})

describe('POST /api/transactions', () => {
  test('returns 201 with created transaction', async ({ app, db, authenticate }) => {
    const { user, token } = await authenticate()
    const category = await insertTestCategory(db, { userId: user.id })
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send(validCreateBody(category.id))
      .expect(201)

    expect(res.body).toMatchObject({
      id: expect.any(String),
      amountCents: DEFAULT_HTTP_CREATE.amountCents,
      description: DEFAULT_HTTP_CREATE.description,
      occurredAt: TEST_OCCURRED_AT_RESPONSE,
      transactionType: 'expense',
      category: { id: category.id, name: DEFAULT_CATEGORY_NAME },
    })
  })

  test.for([
    ['missing amountCents', { occurredAt: TEST_OCCURRED_AT, categoryId: UNKNOWN_UUID }],
    [
      'invalid occurredAt',
      { occurredAt: 'not-a-date', amountCents: 1000, categoryId: UNKNOWN_UUID },
    ],
    [
      'negative amount',
      { occurredAt: TEST_OCCURRED_AT, amountCents: -1, categoryId: UNKNOWN_UUID },
    ],
    ['extra field (strictObject)', { ...validCreateBody(UNKNOWN_UUID), hacker: true }],
    [
      'description longer than 70',
      { ...validCreateBody(UNKNOWN_UUID), description: 'a'.repeat(71) },
    ],
  ])('returns 400 when %s', async ([_label, body], { app, authenticate }) => {
    const { token } = await authenticate()
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send(body)
      .expect(400)
  })
})

describe('GET /api/transactions', () => {
  test('returns 200 with an empty list', async ({ app, authenticate }) => {
    const { token } = await authenticate()

    const res = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(res.body).toEqual({ data: [], meta: { total: 0, limit: 10, offset: 0 } })
  })

  test('returns the page, its meta and honors the range', async ({ app, db, authenticate }) => {
    const { user, token } = await authenticate()
    const category = await insertTestCategory(db, { userId: user.id })
    const { id } = await postTransaction(app, token, category.id)

    const query = `from=${encodeURIComponent(TEST_OCCURRED_AT)}&until=${encodeURIComponent(TEST_OCCURRED_AT_LATER)}&limit=5`
    const inside = await request(app)
      .get(`/api/transactions?${query}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    const outside = await request(app)
      .get(`/api/transactions?from=${encodeURIComponent(TEST_OCCURRED_AT_LATER)}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(inside.body.data).toMatchObject([{ id }])
    expect(inside.body.meta).toEqual({ total: 1, limit: 5, offset: 0 })
    expect(outside.body.meta.total).toBe(0)
  })

  test.for([
    ['limit below 1', '?limit=0'],
    ['invalid from date', '?from=not-a-date'],
    [
      'from after until',
      `?from=${encodeURIComponent(TEST_OCCURRED_AT_LATER)}&until=${encodeURIComponent(TEST_OCCURRED_AT)}`,
    ],
  ])('returns 400 when %s', async ([_label, query], { app, authenticate }) => {
    const { token } = await authenticate()

    await request(app)
      .get(`/api/transactions${query}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
  })
})

describe('GET /api/transactions/category-totals', () => {
  test('returns 200 with an empty list', async ({ app, authenticate }) => {
    const { token } = await authenticate()

    const res = await request(app)
      .get('/api/transactions/category-totals')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(res.body).toEqual([])
  })

  test('returns the expense total of each category', async ({ app, db, authenticate }) => {
    const { user, token } = await authenticate()
    const category = await insertTestCategory(db, { userId: user.id })
    await postTransaction(app, token, category.id)
    await postTransaction(app, token, category.id)

    const res = await request(app)
      .get('/api/transactions/category-totals')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(res.body).toEqual([
      {
        categoryId: category.id,
        categoryName: DEFAULT_CATEGORY_NAME,
        totalCents: DEFAULT_HTTP_CREATE.amountCents * 2,
      },
    ])
  })

  test('returns 400 when from is after until', async ({ app, authenticate }) => {
    const { token } = await authenticate()
    const query = `?from=${encodeURIComponent(TEST_OCCURRED_AT_LATER)}&until=${encodeURIComponent(TEST_OCCURRED_AT)}`

    await request(app)
      .get(`/api/transactions/category-totals${query}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
  })
})

describe('GET /api/transactions/:id', () => {
  test('returns 400 with invalid id', async ({ app, authenticate }) => {
    const { token } = await authenticate()

    await request(app)
      .get('/api/transactions/invalid-uuid')
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
  })
})

describe('PATCH /api/transactions/:id', () => {
  test('returns 400 with empty body', async ({ app, db, authenticate }) => {
    const { user, token } = await authenticate()
    const category = await insertTestCategory(db, { userId: user.id })
    const { id } = await postTransaction(app, token, category.id)

    await request(app)
      .patch(`/api/transactions/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(400)
  })

  test('returns 400 with invalid id', async ({ app, authenticate }) => {
    const { token } = await authenticate()

    await request(app)
      .patch('/api/transactions/invalid-uuid')
      .set('Authorization', `Bearer ${token}`)
      .send({ amountCents: 100 })
      .expect(400)
  })

  test('returns 400 when amount is negative', async ({ app, db, authenticate }) => {
    const { user, token } = await authenticate()
    const category = await insertTestCategory(db, { userId: user.id })
    const { id } = await postTransaction(app, token, category.id)

    await request(app)
      .patch(`/api/transactions/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ amountCents: -1 })
      .expect(400)
  })
})

describe('DELETE /api/transactions/:id', () => {
  test('returns 204 when transaction is deleted', async ({ app, db, authenticate }) => {
    const { user, token } = await authenticate()
    const category = await insertTestCategory(db, { userId: user.id })
    const { id } = await postTransaction(app, token, category.id)

    await request(app)
      .delete(`/api/transactions/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
  })

  test('returns 400 with invalid id', async ({ app, authenticate }) => {
    const { token } = await authenticate()

    await request(app)
      .delete('/api/transactions/invalid-uuid')
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
  })
})

describe('GET /api/transactions/monthly-balance', () => {
  test('returns 200 with monthly balance rows', async ({ app, authenticate }) => {
    const { token } = await authenticate()

    const res = await request(app)
      .get('/api/transactions/monthly-balance')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(res.body).toEqual([])
  })

  test.for([
    ['invalid from date', '?from=not-a-date'],
    ['from after until', `?from=${TEST_OCCURRED_AT_LATER}&until=${TEST_OCCURRED_AT}`],
  ])('returns 400 when %s', async ([_label, query], { app, authenticate }) => {
    const { token } = await authenticate()

    await request(app)
      .get(`/api/transactions/monthly-balance${query}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
  })
})
