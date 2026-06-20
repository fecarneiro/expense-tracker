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

test('POST /categories returns 201 with created category', async () => {
  const access_token = await getAccessToken()

  const res = await request(app)
    .post('/categories')
    .send({ name: 'New Category', categoryType: 'expense' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)

  expect(res.body).toStrictEqual({
    id: expect.any(String),
    name: 'New Category',
    categoryType: 'expense',
  })
})

test('POST /categories with invalid name returns 400', async () => {
  const access_token = await getAccessToken()

  await request(app)
    .post('/categories')
    .send({ name: '', categoryType: 'expense' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(400)
})

test('POST /categories with name longer than 50 characters returns 400', async () => {
  const access_token = await getAccessToken()

  await request(app)
    .post('/categories')
    .send({ name: 'a'.repeat(51), categoryType: 'expense' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(400)
})

test('POST /categories with existing name returns 409', async () => {
  const access_token = await getAccessToken()

  await request(app)
    .post('/categories')
    .send({ name: 'New Category', categoryType: 'expense' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)

  await request(app)
    .post('/categories')
    .send({ name: 'New Category', categoryType: 'expense' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(409)
})

test('GET /categories returns 200 with an empty list', async () => {
  const access_token = await getAccessToken()

  const res = await request(app)
    .get('/categories')
    .set('Authorization', `Bearer ${access_token}`)
    .expect(200)

  expect(res.body).toStrictEqual([])
})

test('GET /categories returns 200 with authenticated user categories', async () => {
  const access_token = await getAccessToken()

  const categoryNames = ['Food', 'Transport', 'Entertainment']
  for (const name of categoryNames) {
    await request(app)
      .post('/categories')
      .send({ name, categoryType: 'expense' })
      .set('Authorization', `Bearer ${access_token}`)
      .expect(201)
  }

  const res = await request(app)
    .get('/categories')
    .set('Authorization', `Bearer ${access_token}`)
    .expect(200)

  expect(res.body).toHaveLength(3)
  expect(res.body).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ id: expect.any(String), name: 'Food', categoryType: 'expense' }),
      expect.objectContaining({
        id: expect.any(String),
        name: 'Transport',
        categoryType: 'expense',
      }),
      expect.objectContaining({
        id: expect.any(String),
        name: 'Entertainment',
        categoryType: 'expense',
      }),
    ]),
  )
})

test('GET /categories does not return categories from other users', async () => {
  const access_token_user1 = await getAccessToken({
    email: 'tester@domain.com',
    password: '12345678',
  })
  const access_token_user2 = await getAccessToken()

  await request(app)
    .post('/categories')
    .send({ name: 'User 1 Category', categoryType: 'expense' })
    .set('Authorization', `Bearer ${access_token_user1}`)
    .expect(201)

  await request(app)
    .post('/categories')
    .send({ name: 'User 2 Category', categoryType: 'expense' })
    .set('Authorization', `Bearer ${access_token_user2}`)
    .expect(201)

  const res = await request(app)
    .get('/categories')
    .set('Authorization', `Bearer ${access_token_user2}`)
    .expect(200)

  expect(res.body).toStrictEqual([
    {
      id: expect.any(String),
      name: 'User 2 Category',
      categoryType: 'expense',
    },
  ])
})

test('GET /categories/:id returns 200 with category', async () => {
  const access_token = await getAccessToken()

  const categoryRes = await request(app)
    .post('/categories')
    .send({ name: 'New Category', categoryType: 'expense' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)

  const categoryId = categoryRes.body.id

  const res = await request(app)
    .get(`/categories/${categoryId}`)
    .set('Authorization', `Bearer ${access_token}`)
    .expect(200)

  expect(res.body).toStrictEqual({
    id: categoryId,
    name: 'New Category',
    categoryType: 'expense',
  })
})

test('GET /categories/:id with invalid id returns 400', async () => {
  const access_token = await getAccessToken()

  await request(app)
    .get('/categories/invalid-uuid')
    .set('Authorization', `Bearer ${access_token}`)
    .expect(400)
})

test('GET /categories/:id with unknown category returns 404', async () => {
  const access_token = await getAccessToken()

  await request(app)
    .get('/categories/00000000-0000-0000-0000-000000000000')
    .set('Authorization', `Bearer ${access_token}`)
    .expect(404)
})

test('GET /categories/:id from another user returns 404', async () => {
  const access_token_user1 = await getAccessToken({
    email: 'tester@domain.com',
    password: '12345678',
  })
  const access_token_user2 = await getAccessToken()

  const categoryRes = await request(app)
    .post('/categories')
    .send({ name: 'User 1 Category', categoryType: 'expense' })
    .set('Authorization', `Bearer ${access_token_user1}`)
    .expect(201)

  const user1CategoryId = categoryRes.body.id

  await request(app)
    .get(`/categories/${user1CategoryId}`)
    .set('Authorization', `Bearer ${access_token_user2}`)
    .expect(404)
})

test('PATCH /categories/:id returns 200 with updated category', async () => {
  const access_token = await getAccessToken()

  const categoryRes = await request(app)
    .post('/categories')
    .send({ name: 'Old Name', categoryType: 'expense' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)

  const categoryId = categoryRes.body.id

  const res = await request(app)
    .patch(`/categories/${categoryId}`)
    .send({ name: 'Updated Name', categoryType: 'income' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(200)

  expect(res.body).toStrictEqual({
    id: categoryId,
    name: 'Updated Name',
    categoryType: 'income',
  })

  const getRes = await request(app)
    .get(`/categories/${categoryId}`)
    .set('Authorization', `Bearer ${access_token}`)
    .expect(200)

  expect(getRes.body).toStrictEqual({
    id: categoryId,
    name: 'Updated Name',
    categoryType: 'income',
  })
})

test('PATCH /categories/:id allows keeping the same name', async () => {
  const access_token = await getAccessToken()

  const categoryRes = await request(app)
    .post('/categories')
    .send({ name: 'Old Name', categoryType: 'expense' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)

  const categoryId = categoryRes.body.id

  const res = await request(app)
    .patch(`/categories/${categoryId}`)
    .send({ name: 'Old Name', categoryType: 'expense' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(200)

  expect(res.body).toStrictEqual({
    id: categoryId,
    name: 'Old Name',
    categoryType: 'expense',
  })
})

test('PATCH /categories/:id with invalid id returns 400', async () => {
  const access_token = await getAccessToken()
  await request(app)
    .patch('/categories/invalid-uuid')
    .send({ name: 'Updated Name', categoryType: 'expense' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(400)
})

test('PATCH /categories/:id with invalid name returns 400', async () => {
  const access_token = await getAccessToken()

  const categoryRes = await request(app)
    .post('/categories')
    .send({ name: 'Old Name', categoryType: 'expense' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)

  const categoryId = categoryRes.body.id

  await request(app)
    .patch(`/categories/${categoryId}`)
    .send({ name: '', categoryType: 'expense' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(400)
})

test('PATCH /categories/:id with name longer than 50 characters returns 400', async () => {
  const access_token = await getAccessToken()

  await request(app)
    .patch('/categories/00000000-0000-0000-0000-000000000000')
    .send({ name: 'a'.repeat(51), categoryType: 'expense' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(400)
})

test('PATCH /categories/:id with unknown category returns 404', async () => {
  const access_token = await getAccessToken()

  await request(app)
    .patch('/categories/00000000-0000-0000-0000-000000000000')
    .send({ name: 'Updated Name', categoryType: 'expense' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(404)
})

test('PATCH /categories/:id from another user returns 404', async () => {
  const access_token_user1 = await getAccessToken({
    email: 'tester@domain.com',
    password: '12345678',
  })
  const access_token_user2 = await getAccessToken()

  const categoryRes = await request(app)
    .post('/categories')
    .send({ name: 'User 1 Category', categoryType: 'expense' })
    .set('Authorization', `Bearer ${access_token_user1}`)
    .expect(201)

  const user1CategoryId = categoryRes.body.id

  await request(app)
    .patch(`/categories/${user1CategoryId}`)
    .send({ name: 'Updated Name', categoryType: 'expense' })
    .set('Authorization', `Bearer ${access_token_user2}`)
    .expect(404)
})

test('PATCH /categories/:id with existing name returns 409', async () => {
  const access_token = await getAccessToken()

  await request(app)
    .post('/categories')
    .send({ name: 'Category 1', categoryType: 'expense' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)

  const categoryRes = await request(app)
    .post('/categories')
    .send({ name: 'Category 2', categoryType: 'expense' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)

  const category2Id = categoryRes.body.id

  await request(app)
    .patch(`/categories/${category2Id}`)
    .send({ name: 'Category 1', categoryType: 'expense' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(409)
})

test('PATCH /categories/:id with existing name in different capitalization returns 409', async () => {
  const access_token = await getAccessToken()

  await request(app)
    .post('/categories')
    .send({ name: 'Category 1', categoryType: 'expense' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)

  const categoryRes = await request(app)
    .post('/categories')
    .send({ name: 'Category 2', categoryType: 'expense' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)

  const category2Id = categoryRes.body.id

  await request(app)
    .patch(`/categories/${category2Id}`)
    .send({ name: 'category 1', categoryType: 'expense' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(409)
})

test('DELETE /categories/:id returns 204', async () => {
  const access_token = await getAccessToken()

  const categoryRes = await request(app)
    .post('/categories')
    .send({ name: 'Category to Delete', categoryType: 'expense' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)

  const categoryId = categoryRes.body.id

  await request(app)
    .delete(`/categories/${categoryId}`)
    .set('Authorization', `Bearer ${access_token}`)
    .expect(204)

  await request(app)
    .get(`/categories/${categoryId}`)
    .set('Authorization', `Bearer ${access_token}`)
    .expect(404)
})

test('DELETE /categories/:id with invalid id returns 400', async () => {
  const access_token = await getAccessToken()

  await request(app)
    .delete('/categories/invalid-uuid')
    .set('Authorization', `Bearer ${access_token}`)
    .expect(400)
})

test('DELETE /categories/:id with unknown category returns 404', async () => {
  const access_token = await getAccessToken()

  await request(app)
    .delete('/categories/00000000-0000-0000-0000-000000000000')
    .set('Authorization', `Bearer ${access_token}`)
    .expect(404)
})

test('DELETE /categories/:id from another user returns 404', async () => {
  const access_token_user1 = await getAccessToken({
    email: 'tester@domain.com',
    password: '12345678',
  })
  const access_token_user2 = await getAccessToken()

  const categoryRes = await request(app)
    .post('/categories')
    .send({ name: 'User 1 Category', categoryType: 'expense' })
    .set('Authorization', `Bearer ${access_token_user1}`)
    .expect(201)

  const user1CategoryId = categoryRes.body.id

  await request(app)
    .delete(`/categories/${user1CategoryId}`)
    .set('Authorization', `Bearer ${access_token_user2}`)
    .expect(404)
})

test('DELETE /categories/:id with category in use returns 409', async () => {
  const access_token = await getAccessToken()

  const categoryRes = await request(app)
    .post('/categories')
    .send({ name: 'Category in Use', categoryType: 'expense' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)

  const categoryId = categoryRes.body.id

  await request(app)
    .post('/transactions')
    .send({
      occurredOn: '2026-01-01',
      amountInCents: 10050,
      transactionType: 'expense',
      categoryId,
    })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)

  await request(app)
    .delete(`/categories/${categoryId}`)
    .set('Authorization', `Bearer ${access_token}`)
    .expect(409)
})

test('POST /categories without categoryType returns 400', async () => {
  const access_token = await getAccessToken()

  await request(app)
    .post('/categories')
    .send({ name: 'No Type' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(400)
})

test('POST /categories with invalid categoryType returns 400', async () => {
  const access_token = await getAccessToken()

  await request(app)
    .post('/categories')
    .send({ name: 'Bad Type', categoryType: 'foo' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(400)
})

test('POST /categories accepts income and expense categoryType', async () => {
  const access_token = await getAccessToken()

  const incomeRes = await request(app)
    .post('/categories')
    .send({ name: 'Salary', categoryType: 'income' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)

  const expenseRes = await request(app)
    .post('/categories')
    .send({ name: 'Groceries', categoryType: 'expense' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)

  expect(incomeRes.body).toStrictEqual({
    id: expect.any(String),
    name: 'Salary',
    categoryType: 'income',
  })
  expect(expenseRes.body).toStrictEqual({
    id: expect.any(String),
    name: 'Groceries',
    categoryType: 'expense',
  })
})

test('GET /categories returns categoryType for both types', async () => {
  const access_token = await getAccessToken()

  await request(app)
    .post('/categories')
    .send({ name: 'Salary', categoryType: 'income' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)

  await request(app)
    .post('/categories')
    .send({ name: 'Food', categoryType: 'expense' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)

  const res = await request(app)
    .get('/categories')
    .set('Authorization', `Bearer ${access_token}`)
    .expect(200)

  expect(res.body).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ name: 'Salary', categoryType: 'income' }),
      expect.objectContaining({ name: 'Food', categoryType: 'expense' }),
    ]),
  )
})

test('PATCH /categories updates categoryType', async () => {
  const access_token = await getAccessToken()

  const createRes = await request(app)
    .post('/categories')
    .send({ name: 'Flexible', categoryType: 'expense' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)

  const id = createRes.body.id

  const patchRes = await request(app)
    .patch(`/categories/${id}`)
    .send({ name: 'Flexible', categoryType: 'income' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(200)

  expect(patchRes.body).toStrictEqual({
    id,
    name: 'Flexible',
    categoryType: 'income',
  })
})

test('PATCH /categories without categoryType returns 400', async () => {
  const access_token = await getAccessToken()

  const createRes = await request(app)
    .post('/categories')
    .send({ name: 'ToPatch', categoryType: 'expense' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)

  await request(app)
    .patch(`/categories/${createRes.body.id}`)
    .send({ name: 'ToPatch' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(400)
})

test('POST /categories rejects duplicate name for the same user even when categoryType differs (current uniqueness is only on name)', async () => {
  const access_token = await getAccessToken()

  await request(app)
    .post('/categories')
    .send({ name: 'UniqueName', categoryType: 'expense' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)

  // Current unique constraint is on (user, lower(name)) only.
  // Same name + different categoryType will be allowed after the upcoming migration
  // that changes uniqueness to (name, categoryType).
  await request(app)
    .post('/categories')
    .send({ name: 'UniqueName', categoryType: 'income' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(409)
})

test('POST /categories without authorization header returns 401', async () => {
  await request(app).post('/categories').send({ name: 'Food', categoryType: 'expense' }).expect(401)
})

test('GET /categories without authorization header returns 401', async () => {
  await request(app).get('/categories').expect(401)
})

test('GET /categories/:id without authorization header returns 401', async () => {
  await request(app).get('/categories/00000000-0000-0000-0000-000000000000').expect(401)
})

test('PATCH /categories/:id without authorization header returns 401', async () => {
  await request(app)
    .patch('/categories/00000000-0000-0000-0000-000000000000')
    .send({ name: 'Updated', categoryType: 'expense' })
    .expect(401)
})

test('DELETE /categories/:id without authorization header returns 401', async () => {
  await request(app).delete('/categories/00000000-0000-0000-0000-000000000000').expect(401)
})
