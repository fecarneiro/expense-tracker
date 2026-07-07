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
  amountInCents: 1000,
  notes: 'my notes',
} as const satisfies Omit<CreateTransactionBodyInput, 'categoryId'>

function validCreateBody(categoryId: string): CreateTransactionBodyInput {
  return { ...DEFAULT_HTTP_CREATE, categoryId }
}

async function postTransaction(app: HttpTestApp, token: string, categoryId: string) {
  const res = await request(app)
    .post('/transactions')
    .set('Authorization', `Bearer ${token}`)
    .send(validCreateBody(categoryId))
    .expect(201)

  return res.body as { id: string }
}

describe('authorization', () => {
  test.for([
    ['POST /transactions', 'post', '/transactions', validCreateBody(UNKNOWN_UUID)],
    ['GET /transactions', 'get', '/transactions'],
    ['GET /transactions/:id', 'get', `/transactions/${UNKNOWN_UUID}`],
    ['PATCH /transactions/:id', 'patch', `/transactions/${UNKNOWN_UUID}`, { amountInCents: 100 }],
    ['DELETE /transactions/:id', 'delete', `/transactions/${UNKNOWN_UUID}`],
    ['GET /transactions/monthly-balance', 'get', '/transactions/monthly-balance'],
  ] as const)('%s returns 401 without authorization header', async ([_route, method, path, body], {
    app,
  }) => {
    await sendUnauthorized(app, method, path, body).expect(401)
  })
})

describe('POST /transactions', () => {
  test('returns 201 with created transaction', async ({ app, db, authenticate }) => {
    const { user, token } = await authenticate()
    const category = await insertTestCategory(db, { userId: user.id })
    const res = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send(validCreateBody(category.id))
      .expect(201)

    expect(res.body).toMatchObject({
      id: expect.any(String),
      amountInCents: DEFAULT_HTTP_CREATE.amountInCents,
      notes: DEFAULT_HTTP_CREATE.notes,
      occurredAt: TEST_OCCURRED_AT_RESPONSE,
      transactionType: 'expense',
      category: { id: category.id, name: DEFAULT_CATEGORY_NAME },
    })
  })

  test.for([
    ['missing amountInCents', { occurredAt: TEST_OCCURRED_AT, categoryId: UNKNOWN_UUID }],
    [
      'invalid occurredAt',
      { occurredAt: 'not-a-date', amountInCents: 1000, categoryId: UNKNOWN_UUID },
    ],
    [
      'negative amount',
      { occurredAt: TEST_OCCURRED_AT, amountInCents: -1, categoryId: UNKNOWN_UUID },
    ],
    ['extra field (strictObject)', { ...validCreateBody(UNKNOWN_UUID), hacker: true }],
    ['notes longer than 70', { ...validCreateBody(UNKNOWN_UUID), notes: 'a'.repeat(71) }],
  ])('returns 400 when %s', async ([_label, body], { app, authenticate }) => {
    const { token } = await authenticate()
    await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send(body)
      .expect(400)
  })
})

describe('GET /transactions', () => {
  test('returns 200 with an empty list', async ({ app, authenticate }) => {
    const { token } = await authenticate()

    const res = await request(app)
      .get('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(res.body).toEqual([])
  })

  test('returns 400 with invalid query params', async ({ app, authenticate }) => {
    const { token } = await authenticate()

    await request(app)
      .get('/transactions?limit=0')
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
  })
})

describe('GET /transactions/:id', () => {
  test('returns 400 with invalid id', async ({ app, authenticate }) => {
    const { token } = await authenticate()

    await request(app)
      .get('/transactions/invalid-uuid')
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
  })
})

describe('PATCH /transactions/:id', () => {
  test('returns 400 with empty body', async ({ app, db, authenticate }) => {
    const { user, token } = await authenticate()
    const category = await insertTestCategory(db, { userId: user.id })
    const { id } = await postTransaction(app, token, category.id)

    await request(app)
      .patch(`/transactions/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(400)
  })

  test('returns 400 with invalid id', async ({ app, authenticate }) => {
    const { token } = await authenticate()

    await request(app)
      .patch('/transactions/invalid-uuid')
      .set('Authorization', `Bearer ${token}`)
      .send({ amountInCents: 100 })
      .expect(400)
  })

  test('returns 400 when amount is negative', async ({ app, db, authenticate }) => {
    const { user, token } = await authenticate()
    const category = await insertTestCategory(db, { userId: user.id })
    const { id } = await postTransaction(app, token, category.id)

    await request(app)
      .patch(`/transactions/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ amountInCents: -1 })
      .expect(400)
  })
})

describe('DELETE /transactions/:id', () => {
  test('returns 204 when transaction is deleted', async ({ app, db, authenticate }) => {
    const { user, token } = await authenticate()
    const category = await insertTestCategory(db, { userId: user.id })
    const { id } = await postTransaction(app, token, category.id)

    await request(app)
      .delete(`/transactions/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
  })

  test('returns 400 with invalid id', async ({ app, authenticate }) => {
    const { token } = await authenticate()

    await request(app)
      .delete('/transactions/invalid-uuid')
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
  })
})

describe('GET /transactions/monthly-balance', () => {
  test('returns 200 with monthly balance rows', async ({ app, authenticate }) => {
    const { token } = await authenticate()

    const res = await request(app)
      .get('/transactions/monthly-balance')
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
      .get(`/transactions/monthly-balance${query}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
  })
})
