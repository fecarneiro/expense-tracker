import request from 'supertest'
import { beforeAll, beforeEach, expect, test } from 'vitest'
import { createApp } from '../../../app.js'
import { createContainer } from '../../../container.js'
import type { Database } from '../../../database/db.js'
import { categoriesTable } from '../../../database/schemas/category.schema.js'
import { transactionsTable } from '../../../database/schemas/transaction.schema.js'
import { usersTable } from '../../../database/schemas/user.schema.js'
import { setupDbTest } from '../../../tests/setup-db-test.js'

let app: ReturnType<typeof createApp>
let dbTest: Database

beforeAll(async () => {
  const setup = await setupDbTest()
  dbTest = setup.dbTest as unknown as Database
  app = createApp(createContainer(dbTest))

  return async () => setup.client.close()
})

beforeEach(async () => {
  await dbTest.delete(transactionsTable)
  await dbTest.delete(categoriesTable)
  await dbTest.delete(usersTable)
})

async function getAccessToken({ email = 'johndoe@email.com', password = '12345678' } = {}) {
  const credentials = { email, password }
  await request(app).post('/auth/register').send(credentials).expect(201)
  const res = await request(app).post('/auth/login').send(credentials).expect(200)

  return res.body.access_token
}

async function createCategory(access_token: string, { name = 'Eating out' } = {}) {
  return request(app)
    .post('/categories')
    .send({ name })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)
}

async function createTransaction(
  access_token: string,
  {
    categoryId,
    occurredOn = '2026-01-01',
    amountInCents = 10050,
    transactionType = 'expense',
    notes,
  }: {
    categoryId: string
    occurredOn?: string
    amountInCents?: number
    transactionType?: 'income' | 'expense'
    notes?: string
  },
) {
  return request(app)
    .post('/transactions')
    .send({
      occurredOn,
      amountInCents,
      transactionType,
      categoryId,
      ...(notes === undefined ? {} : { notes }),
    })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)
}

test('POST /transactions returns 201 with created transaction', async () => {
  const access_token = await getAccessToken()
  const category = await createCategory(access_token)

  const res = await request(app)
    .post('/transactions')
    .send({
      occurredOn: '2026-01-01',
      amountInCents: 10050,
      transactionType: 'expense',
      categoryId: category.body.id,
    })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)

  expect(res.body).toStrictEqual({
    id: expect.any(String),
    occurredOn: '2026-01-01',
    amountInCents: 10050,
    transactionType: 'expense',
    category: {
      id: category.body.id,
      name: category.body.name,
    },
    notes: null,
    createdAt: expect.any(String),
  })
})

test('POST /transactions with invalid body returns 400', async () => {
  const access_token = await getAccessToken()

  await request(app)
    .post('/transactions')
    .send({
      occurredOn: '2026-01-01',
    })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(400)
})

test('POST /transactions with unknown category returns 404', async () => {
  const access_token = await getAccessToken()
  await request(app)
    .post('/transactions')
    .send({
      occurredOn: '2026-01-01',
      amountInCents: 10050,
      transactionType: 'expense',
      categoryId: '00000000-0000-0000-0000-000000000000',
    })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(404)
})

test('POST /transactions with category from another user returns 404', async () => {
  const access_token_user1 = await getAccessToken()
  const access_token_user2 = await getAccessToken({
    email: 'user2@domain.com',
    password: '123456789',
  })
  const category_user2 = await createCategory(access_token_user2)

  await request(app)
    .post('/transactions')
    .send({
      occurredOn: '2026-01-01',
      amountInCents: 10050,
      transactionType: 'expense',
      categoryId: category_user2.body.id,
    })
    .set('Authorization', `Bearer ${access_token_user1}`)
    .expect(404)
})

test('POST /transactions with empty notes returns 201 with null notes', async () => {
  const access_token = await getAccessToken()
  const category = await createCategory(access_token)

  const res = await request(app)
    .post('/transactions')
    .send({
      occurredOn: '2026-01-01',
      amountInCents: 10050,
      transactionType: 'expense',
      categoryId: category.body.id,
      notes: '',
    })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)

  expect(res.body).toStrictEqual({
    id: expect.any(String),
    occurredOn: '2026-01-01',
    amountInCents: 10050,
    transactionType: 'expense',
    category: {
      id: category.body.id,
      name: category.body.name,
    },
    notes: null,
    createdAt: expect.any(String),
  })
})

test('POST /transactions with omitted notes returns 201 with null notes', async () => {
  const access_token = await getAccessToken()
  const category = await createCategory(access_token)

  const res = await request(app)
    .post('/transactions')
    .send({
      occurredOn: '2026-01-01',
      amountInCents: 10050,
      transactionType: 'expense',
      categoryId: category.body.id,
    })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)

  expect(res.body).toStrictEqual({
    id: expect.any(String),
    occurredOn: '2026-01-01',
    amountInCents: 10050,
    transactionType: 'expense',
    category: {
      id: category.body.id,
      name: category.body.name,
    },
    notes: null,
    createdAt: expect.any(String),
  })
})

test('POST /transactions with notes longer than 70 characters returns 400', async () => {
  const access_token = await getAccessToken()
  const category = await createCategory(access_token)

  await request(app)
    .post('/transactions')
    .send({
      occurredOn: '2026-01-01',
      amountInCents: 10050,
      transactionType: 'expense',
      categoryId: category.body.id,
      notes: 'a'.repeat(71),
    })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(400)
})

test('POST /transactions without authorization header returns 401', async () => {
  await request(app)
    .post('/transactions')
    .send({
      occurredOn: '2026-01-01',
      amountInCents: 10050,
      transactionType: 'expense',
      categoryId: '00000000-0000-0000-0000-000000000000',
    })
    .expect(401)
})

test('GET /transactions returns 200 with an empty list', async () => {
  const access_token = await getAccessToken()
  const res = await request(app)
    .get('/transactions')
    .set('Authorization', `Bearer ${access_token}`)
    .expect(200)

  expect(res.body).toStrictEqual([])
})
test('GET /transactions returns 200 with authenticated user transactions', async () => {
  const access_token = await getAccessToken()
  const category = await createCategory(access_token)
  const oldestTransaction = await createTransaction(access_token, {
    categoryId: category.body.id,
    occurredOn: '2026-01-01',
    amountInCents: 10050,
    notes: 'breakfast',
  })
  const newestTransaction = await createTransaction(access_token, {
    categoryId: category.body.id,
    occurredOn: '2026-01-02',
    amountInCents: 20075,
    notes: 'lunch',
  })

  const res = await request(app)
    .get('/transactions')
    .set('Authorization', `Bearer ${access_token}`)
    .expect(200)

  expect(res.body).toStrictEqual([newestTransaction.body, oldestTransaction.body])
})

test('GET /transactions does not return transactions from other users', async () => {
  const access_token_user1 = await getAccessToken()
  const access_token_user2 = await getAccessToken({
    email: 'user2@domain.com',
    password: '123456789',
  })
  const category_user2 = await createCategory(access_token_user2)

  await createTransaction(access_token_user2, {
    categoryId: category_user2.body.id,
    notes: 'not mine',
  })

  const res = await request(app)
    .get('/transactions')
    .set('Authorization', `Bearer ${access_token_user1}`)
    .expect(200)

  expect(res.body).toStrictEqual([])
})

test('GET /transactions respects limit and offset', async () => {
  const access_token = await getAccessToken()
  const category = await createCategory(access_token)

  await createTransaction(access_token, {
    categoryId: category.body.id,
    occurredOn: '2026-01-01',
    notes: 'oldest',
  })
  const middleTransaction = await createTransaction(access_token, {
    categoryId: category.body.id,
    occurredOn: '2026-01-02',
    notes: 'middle',
  })
  await createTransaction(access_token, {
    categoryId: category.body.id,
    occurredOn: '2026-01-03',
    notes: 'newest',
  })

  const res = await request(app)
    .get('/transactions?limit=1&offset=1')
    .set('Authorization', `Bearer ${access_token}`)
    .expect(200)

  expect(res.body).toStrictEqual([middleTransaction.body])
})

test('GET /transactions with invalid query params returns 400', async () => {
  const access_token = await getAccessToken()

  await request(app)
    .get('/transactions?limit=0')
    .set('Authorization', `Bearer ${access_token}`)
    .expect(400)
})

test('GET /transactions without authorization header returns 401', async () => {
  await request(app).get('/transactions').expect(401)
})

test('GET /transactions/:id returns 200 with transaction', async () => {
  const access_token = await getAccessToken()
  const category = await createCategory(access_token)
  const transaction = await createTransaction(access_token, {
    categoryId: category.body.id,
    notes: 'find me',
  })

  const res = await request(app)
    .get(`/transactions/${transaction.body.id}`)
    .set('Authorization', `Bearer ${access_token}`)
    .expect(200)

  expect(res.body).toStrictEqual(transaction.body)
})

test('GET /transactions/:id with invalid id returns 400', async () => {
  const access_token = await getAccessToken()

  await request(app)
    .get('/transactions/invalid-uuid')
    .set('Authorization', `Bearer ${access_token}`)
    .expect(400)
})

test('GET /transactions/:id with unknown transaction returns 404', async () => {
  const access_token = await getAccessToken()

  await request(app)
    .get('/transactions/00000000-0000-0000-0000-000000000000')
    .set('Authorization', `Bearer ${access_token}`)
    .expect(404)
})

test('GET /transactions/:id from another user returns 404', async () => {
  const access_token_user1 = await getAccessToken()
  const access_token_user2 = await getAccessToken({
    email: 'user2@domain.com',
    password: '123456789',
  })
  const category_user2 = await createCategory(access_token_user2)
  const transaction_user2 = await createTransaction(access_token_user2, {
    categoryId: category_user2.body.id,
  })

  await request(app)
    .get(`/transactions/${transaction_user2.body.id}`)
    .set('Authorization', `Bearer ${access_token_user1}`)
    .expect(404)
})

test('GET /transactions/:id without authorization header returns 401', async () => {
  await request(app).get('/transactions/00000000-0000-0000-0000-000000000000').expect(401)
})

test('PATCH /transactions/:id returns 200 with updated transaction', async () => {
  const access_token = await getAccessToken()
  const category = await createCategory(access_token)
  const transaction = await createTransaction(access_token, {
    categoryId: category.body.id,
    notes: 'old note',
  })

  const res = await request(app)
    .patch(`/transactions/${transaction.body.id}`)
    .send({
      occurredOn: '2026-02-03',
      amountInCents: 30025,
      transactionType: 'income',
      notes: 'updated note',
    })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(200)

  expect(res.body).toStrictEqual({
    ...transaction.body,
    occurredOn: '2026-02-03',
    amountInCents: 30025,
    transactionType: 'income',
    notes: 'updated note',
  })
})

test('PATCH /transactions/:id preserves omitted fields', async () => {
  const access_token = await getAccessToken()
  const category = await createCategory(access_token)
  const transaction = await createTransaction(access_token, {
    categoryId: category.body.id,
    occurredOn: '2026-01-10',
    amountInCents: 10050,
    transactionType: 'expense',
    notes: 'keep me',
  })

  const res = await request(app)
    .patch(`/transactions/${transaction.body.id}`)
    .send({ amountInCents: 50075 })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(200)

  expect(res.body).toStrictEqual({
    ...transaction.body,
    amountInCents: 50075,
  })
})

test('PATCH /transactions/:id with empty body returns 400', async () => {
  const access_token = await getAccessToken()
  const category = await createCategory(access_token)
  const transaction = await createTransaction(access_token, {
    categoryId: category.body.id,
  })

  await request(app)
    .patch(`/transactions/${transaction.body.id}`)
    .send({})
    .set('Authorization', `Bearer ${access_token}`)
    .expect(400)
})

test('PATCH /transactions/:id with invalid body returns 400', async () => {
  const access_token = await getAccessToken()
  const category = await createCategory(access_token)
  const transaction = await createTransaction(access_token, {
    categoryId: category.body.id,
  })

  await request(app)
    .patch(`/transactions/${transaction.body.id}`)
    .send({ amountInCents: -1 })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(400)
})

test('PATCH /transactions/:id with invalid id returns 400', async () => {
  const access_token = await getAccessToken()

  await request(app)
    .patch('/transactions/invalid-uuid')
    .send({ amountInCents: 50075 })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(400)
})

test('PATCH /transactions/:id with unknown transaction returns 404', async () => {
  const access_token = await getAccessToken()

  await request(app)
    .patch('/transactions/00000000-0000-0000-0000-000000000000')
    .send({ amountInCents: 50075 })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(404)
})

test('PATCH /transactions/:id from another user returns 404', async () => {
  const access_token_user1 = await getAccessToken()
  const access_token_user2 = await getAccessToken({
    email: 'user2@domain.com',
    password: '123456789',
  })
  const category_user2 = await createCategory(access_token_user2)
  const transaction_user2 = await createTransaction(access_token_user2, {
    categoryId: category_user2.body.id,
    amountInCents: 10050,
  })

  await request(app)
    .patch(`/transactions/${transaction_user2.body.id}`)
    .send({ amountInCents: 50075 })
    .set('Authorization', `Bearer ${access_token_user1}`)
    .expect(404)

  const res = await request(app)
    .get(`/transactions/${transaction_user2.body.id}`)
    .set('Authorization', `Bearer ${access_token_user2}`)
    .expect(200)

  expect(res.body.amountInCents).toBe(10050)
})

test('PATCH /transactions/:id with category from another user returns 404', async () => {
  const access_token_user1 = await getAccessToken()
  const access_token_user2 = await getAccessToken({
    email: 'user2@domain.com',
    password: '123456789',
  })
  const category_user1 = await createCategory(access_token_user1, { name: 'Mine' })
  const category_user2 = await createCategory(access_token_user2, { name: 'Theirs' })
  const transaction_user1 = await createTransaction(access_token_user1, {
    categoryId: category_user1.body.id,
  })

  await request(app)
    .patch(`/transactions/${transaction_user1.body.id}`)
    .send({ categoryId: category_user2.body.id })
    .set('Authorization', `Bearer ${access_token_user1}`)
    .expect(404)
})

test('PATCH /transactions/:id with empty notes returns 200 with null notes', async () => {
  const access_token = await getAccessToken()
  const category = await createCategory(access_token)
  const transaction = await createTransaction(access_token, {
    categoryId: category.body.id,
    notes: 'clear me',
  })

  const res = await request(app)
    .patch(`/transactions/${transaction.body.id}`)
    .send({ notes: '' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(200)

  expect(res.body).toStrictEqual({
    ...transaction.body,
    notes: null,
  })
})

test('PATCH /transactions/:id without authorization header returns 401', async () => {
  await request(app)
    .patch('/transactions/00000000-0000-0000-0000-000000000000')
    .send({ amountInCents: 50075 })
    .expect(401)
})

test('DELETE /transactions/:id returns 204', async () => {
  const access_token = await getAccessToken()
  const category = await createCategory(access_token)
  const transaction = await createTransaction(access_token, {
    categoryId: category.body.id,
  })

  await request(app)
    .delete(`/transactions/${transaction.body.id}`)
    .set('Authorization', `Bearer ${access_token}`)
    .expect(204)

  await request(app)
    .get(`/transactions/${transaction.body.id}`)
    .set('Authorization', `Bearer ${access_token}`)
    .expect(404)
})

test('DELETE /transactions/:id with invalid id returns 400', async () => {
  const access_token = await getAccessToken()

  await request(app)
    .delete('/transactions/invalid-uuid')
    .set('Authorization', `Bearer ${access_token}`)
    .expect(400)
})

test('DELETE /transactions/:id with unknown transaction returns 404', async () => {
  const access_token = await getAccessToken()

  await request(app)
    .delete('/transactions/00000000-0000-0000-0000-000000000000')
    .set('Authorization', `Bearer ${access_token}`)
    .expect(404)
})

test('DELETE /transactions/:id from another user returns 404', async () => {
  const access_token_user1 = await getAccessToken()
  const access_token_user2 = await getAccessToken({
    email: 'user2@domain.com',
    password: '123456789',
  })
  const category_user2 = await createCategory(access_token_user2)
  const transaction_user2 = await createTransaction(access_token_user2, {
    categoryId: category_user2.body.id,
  })

  await request(app)
    .delete(`/transactions/${transaction_user2.body.id}`)
    .set('Authorization', `Bearer ${access_token_user1}`)
    .expect(404)

  await request(app)
    .get(`/transactions/${transaction_user2.body.id}`)
    .set('Authorization', `Bearer ${access_token_user2}`)
    .expect(200)
})

test('DELETE /transactions/:id without authorization header returns 401', async () => {
  await request(app).delete('/transactions/00000000-0000-0000-0000-000000000000').expect(401)
})
