import request from 'supertest'
import { describe } from 'vitest'
import { TEST_OCCURRED_AT } from '../../../tests/constants.js'
import { insertTestCategory } from '../../../tests/factories/category.factory.js'
import { insertTestUser } from '../../../tests/factories/user.factory.js'
import { httpTest as test } from '../../../tests/fixtures/http.fixture.js'
import type { CreateTransactionBodyInput } from '../transaction.schemas.js'

const DEFAULT_HTTP_CREATE = {
  occurredAt: TEST_OCCURRED_AT,
  amountInCents: 1000,
  notes: 'my notes',
} as const satisfies Omit<CreateTransactionBodyInput, 'categoryId'>

describe('POST /transactions', () => {
  test('returns 201 with created transaction', async ({ app, db, createAccessToken }) => {
    // Arrange: insertTestCategory(db, { userId from insertTestUser or token user }), createAccessToken()
    // Act: request(app).post('/transactions').send(validCreateBody(category.id)).set('Authorization', `Bearer ${token}`).expect(201)
    // Assert: res.body toMatchObject({ amountInCents, notes, occurredAt: TEST_OCCURRED_AT_RESPONSE, category: { id, name: DEFAULT_CATEGORY_NAME } })
    const user = await insertTestUser(db)
    const category = await insertTestCategory(db, { userId: user.id })
  })

  test('returns 401 without authorization header', async ({ app, db, createAccessToken }) => {
    void app
    void db
    void createAccessToken
    // Arrange: validCreateBody with any categoryId (body alone triggers 401 before business rules)
    // Act: request(app).post('/transactions').send(body).expect(401)
  })

  // test.each([
  //   ['missing amountInCents', { occurredAt: TEST_OCCURRED_AT, categoryId: VALID_UUID }],
  //   ['invalid occurredAt', { occurredAt: 'not-a-date', amountInCents: 1000, categoryId: VALID_UUID }],
  //   ['negative amount', { occurredAt: TEST_OCCURRED_AT, amountInCents: -1, categoryId: VALID_UUID }],
  //   ['extra field (strictObject)', { ...validCreateBody(categoryId), hacker: true }],
  //   ['notes longer than 70', { ...validCreateBody(categoryId), notes: 'a'.repeat(71) }],
  // ])('returns 400 when %s', async (_label, body, { app, createAccessToken }) => {
  //   const token = await createAccessToken()
  //   await request(app).post('/transactions').send(body).set('Authorization', `Bearer ${token}`).expect(400)
  // })
})

describe('GET /transactions', () => {
  test('returns 200 with an empty list', async ({ app, db, createAccessToken }) => {
    void app
    void db
    void createAccessToken
    // Arrange: createAccessToken() only
    // Act: request(app).get('/transactions').set('Authorization', `Bearer ${token}`).expect(200)
    // Assert: expect(res.body).toEqual([])
  })

  test('returns 401 without authorization header', async ({ app, db, createAccessToken }) => {
    void app
    void db
    void createAccessToken
    // Act: request(app).get('/transactions').expect(401)
  })

  test('returns 400 with invalid query params', async ({ app, db, createAccessToken }) => {
    void app
    void db
    void createAccessToken
    // Arrange: createAccessToken()
    // Act: request(app).get('/transactions?limit=0').set('Authorization', `Bearer ${token}`).expect(400)
  })
})

describe('GET /transactions/:id', () => {
  test('returns 401 without authorization header', async ({ app, db, createAccessToken }) => {
    void app
    void db
    void createAccessToken
    // Act: request(app).get(`/transactions/${UNKNOWN_UUID}`).expect(401)
  })

  test('returns 400 with invalid id', async ({ app, db, createAccessToken }) => {
    void app
    void db
    void createAccessToken
    // Arrange: createAccessToken()
    // Act: request(app).get('/transactions/invalid-uuid').set('Authorization', `Bearer ${token}`).expect(400)
  })
})

describe('PATCH /transactions/:id', () => {
  test('returns 401 without authorization header', async ({ app, db, createAccessToken }) => {
    void app
    void db
    void createAccessToken
    // Act: request(app).patch(`/transactions/${UNKNOWN_UUID}`).send({ amountInCents: 100 }).expect(401)
  })

  test('returns 400 with empty body', async ({ app, db, createAccessToken }) => {
    void app
    void db
    void createAccessToken
    // Arrange: insertTestUser + insertTestCategory + POST 201 or factories + create via service for id
    // Act: request(app).patch(`/transactions/${id}`).send({}).set('Authorization', `Bearer ${token}`).expect(400)
  })

  test('returns 400 with invalid id', async ({ app, db, createAccessToken }) => {
    void app
    void db
    void createAccessToken
    // Arrange: createAccessToken()
    // Act: request(app).patch('/transactions/invalid-uuid').send({ amountInCents: 100 }).set('Authorization', `Bearer ${token}`).expect(400)
  })

  // test.each([
  //   ['negative amount', { amountInCents: -1 }],
  // ])('returns 400 when %s', async (_label, body, { app, db, createAccessToken }) => {
  //   void db
  //   // Arrange: token + existing transaction id
  //   await request(app).patch(`/transactions/${id}`).send(body).set('Authorization', `Bearer ${token}`).expect(400)
  // })
})

describe('DELETE /transactions/:id', () => {
  test('returns 204 when transaction is deleted', async ({ app, db, createAccessToken }) => {
    void app
    void db
    void createAccessToken
    // Arrange: insertTestUser + insertTestCategory + POST 201 (or service create) for transaction id
    // Act: request(app).delete(`/transactions/${id}`).set('Authorization', `Bearer ${token}`).expect(204)
  })

  test('returns 401 without authorization header', async ({ app, db, createAccessToken }) => {
    void app
    void db
    void createAccessToken
    // Act: request(app).delete(`/transactions/${UNKNOWN_UUID}`).expect(401)
  })

  test('returns 400 with invalid id', async ({ app, db, createAccessToken }) => {
    void app
    void db
    void createAccessToken
    // Arrange: createAccessToken()
    // Act: request(app).delete('/transactions/invalid-uuid').set('Authorization', `Bearer ${token}`).expect(400)
  })
})

describe('GET /transactions/monthly-balance', () => {
  test('returns 200 with monthly balance rows', async ({ app, db, createAccessToken }) => {
    void app
    void db
    void createAccessToken
    // Arrange: user + categories + transactions (when service test for findMonthlyTotalsInRange exists)
    // Act: request(app).get('/transactions/monthly-balance').set('Authorization', `Bearer ${token}`).expect(200)
    // Assert: toMatchObject on first row — incomeTotal, expenseTotal, balance (partial)
  })

  test('returns 401 without authorization header', async ({ app, db, createAccessToken }) => {
    void app
    void db
    void createAccessToken
    // Act: request(app).get('/transactions/monthly-balance').expect(401)
  })

  test('returns 400 with invalid query params', async ({ app, db, createAccessToken }) => {
    void app
    void db
    void createAccessToken
    // Arrange: createAccessToken()
    // Act: request(app).get('/transactions/monthly-balance?from=bad').set('Authorization', `Bearer ${token}`).expect(400)
  })

  // test.each([
  //   ['from after until', '?from=2026-02-01T00:00:00+00:00&until=2026-01-01T00:00:00+00:00'],
  //   ['invalid from date', '?from=not-a-date'],
  // ])('returns 400 when %s', async (_label, query, { app, createAccessToken }) => {
  //   const token = await createAccessToken()
  //   // invalid date → Zod 400; from after until → service InvalidTransactionRangeError (400)
  //   await request(app).get(`/transactions/monthly-balance${query}`).set('Authorization', `Bearer ${token}`).expect(400)
  // })
})
