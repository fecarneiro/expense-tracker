import request from 'supertest'
import { beforeAll, beforeEach, expect, test } from 'vitest'
import { createApp } from '../../../app.js'
import { createContainer } from '../../../container.js'
import type { Database } from '../../../database/db.js'
import { categoriesTable } from '../../../database/schemas/category.schema.js'
import { transactionsTable } from '../../../database/schemas/transaction.schema.js'
import { usersTable } from '../../../database/schemas/user.schema.js'
import { setupDbTest } from '../../../tests/setup-db-test.js'
import type { CategoryType } from '../../categories/category.types.js'

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

async function createCategory(
  access_token: string,
  {
    name = 'Eating out',
    categoryType = 'expense',
  }: { name?: string; categoryType?: CategoryType } = {},
) {
  return request(app)
    .post('/categories')
    .send({ name, categoryType })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)
}

async function createTransaction(
  access_token: string,
  {
    categoryId,
    occurredOn,
    amountInCents,
    transactionType,
  }: {
    categoryId: string
    occurredOn: string
    amountInCents: number
    transactionType: 'income' | 'expense'
  },
) {
  return request(app)
    .post('/transactions')
    .send({
      occurredOn,
      amountInCents,
      transactionType,
      categoryId,
    })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)
}

test('GET /analytics/balances returns 200 with an empty list', async () => {
  const access_token = await getAccessToken()

  const res = await request(app)
    .get('/analytics/balances?startMonth=2026-01&endMonth=2026-01')
    .set('Authorization', `Bearer ${access_token}`)
    .expect(200)

  expect(res.body).toStrictEqual([])
})

test('GET /analytics/balances returns 200 with monthly totals', async () => {
  const access_token = await getAccessToken()
  const category = await createCategory(access_token)

  await createTransaction(access_token, {
    categoryId: category.body.id,
    occurredOn: '2026-01-15',
    amountInCents: 100000,
    transactionType: 'income',
  })
  await createTransaction(access_token, {
    categoryId: category.body.id,
    occurredOn: '2026-01-20',
    amountInCents: 30000,
    transactionType: 'expense',
  })
  await createTransaction(access_token, {
    categoryId: category.body.id,
    occurredOn: '2026-02-10',
    amountInCents: 5000,
    transactionType: 'expense',
  })

  const res = await request(app)
    .get('/analytics/balances?startMonth=2026-01&endMonth=2026-02')
    .set('Authorization', `Bearer ${access_token}`)
    .expect(200)

  expect(res.body).toStrictEqual([
    {
      month: '2026-02',
      incomeTotal: 0,
      expenseTotal: 5000,
      balance: -5000,
    },
    {
      month: '2026-01',
      incomeTotal: 100000,
      expenseTotal: 30000,
      balance: 70000,
    },
  ])
})

test('GET /analytics/balances respects startMonth and endMonth query params', async () => {
  const access_token = await getAccessToken()
  const category = await createCategory(access_token)

  await createTransaction(access_token, {
    categoryId: category.body.id,
    occurredOn: '2026-01-10',
    amountInCents: 10000,
    transactionType: 'income',
  })
  await createTransaction(access_token, {
    categoryId: category.body.id,
    occurredOn: '2026-03-10',
    amountInCents: 20000,
    transactionType: 'income',
  })

  const res = await request(app)
    .get('/analytics/balances?startMonth=2026-02&endMonth=2026-02')
    .set('Authorization', `Bearer ${access_token}`)
    .expect(200)

  expect(res.body).toStrictEqual([])
})

test('GET /analytics/balances does not include other users transactions', async () => {
  const access_token_user1 = await getAccessToken()
  const access_token_user2 = await getAccessToken({
    email: 'user2@domain.com',
    password: '123456789',
  })
  const category_user2 = await createCategory(access_token_user2)

  await createTransaction(access_token_user2, {
    categoryId: category_user2.body.id,
    occurredOn: '2026-01-10',
    amountInCents: 50000,
    transactionType: 'income',
  })

  const res = await request(app)
    .get('/analytics/balances?startMonth=2026-01&endMonth=2026-01')
    .set('Authorization', `Bearer ${access_token_user1}`)
    .expect(200)

  expect(res.body).toStrictEqual([])
})

test('GET /analytics/balances with invalid query params returns 400', async () => {
  const access_token = await getAccessToken()

  await request(app)
    .get('/analytics/balances?startMonth=2026-13')
    .set('Authorization', `Bearer ${access_token}`)
    .expect(400)
})

test('GET /analytics/balances without authorization header returns 401', async () => {
  await request(app).get('/analytics/balances').expect(401)
})
