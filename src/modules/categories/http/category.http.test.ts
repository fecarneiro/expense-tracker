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
    .send({ name: 'New Category' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)

  expect(res.body).toStrictEqual({
    id: expect.any(String),
    name: 'New Category',
  })
})

test('POST /categories with invalid name returns 400', async () => {
  const access_token = await getAccessToken()

  await request(app)
    .post('/categories')
    .send({ name: '' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(400)
})

test('POST /categories with existing name returns 409', async () => {
  const access_token = await getAccessToken()

  await request(app)
    .post('/categories')
    .send({ name: 'New Category' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)

  await request(app)
    .post('/categories')
    .send({ name: 'New Category' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(409)
})

test('GET /categories returns 200 with authenticated user categories', async () => {
  const access_token = await getAccessToken()

  const categoryNames = ['Food', 'Transport', 'Entertainment']
  for (const name of categoryNames) {
    await request(app)
      .post('/categories')
      .send({ name })
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
      expect.objectContaining({ id: expect.any(String), name: 'Food' }),
      expect.objectContaining({ id: expect.any(String), name: 'Transport' }),
      expect.objectContaining({ id: expect.any(String), name: 'Entertainment' }),
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
    .send({ name: 'User 1 Category' })
    .set('Authorization', `Bearer ${access_token_user1}`)
    .expect(201)

  await request(app)
    .post('/categories')
    .send({ name: 'User 2 Category' })
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
    },
  ])
})

test('GET /categories/:id returns 200 with category', async () => {
  const access_token = await getAccessToken()

  const categoryRes = await request(app)
    .post('/categories')
    .send({ name: 'New Category' })
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
  })
})

test('GET /categories/:id with invalid id returns 400', async () => {
  const access_token = await getAccessToken()

  await request(app)
    .post('/categories')
    .send({ name: 'New Category' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)

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
    .send({ name: 'User 1 Category' })
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
    .send({ name: 'Old Name' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)

  const categoryId = categoryRes.body.id

  const res = await request(app)
    .patch(`/categories/${categoryId}`)
    .send({ name: 'Updated Name' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(200)

  expect(res.body).toStrictEqual({
    id: categoryId,
    name: 'Updated Name',
  })

  const getRes = await request(app)
    .get(`/categories/${categoryId}`)
    .set('Authorization', `Bearer ${access_token}`)
    .expect(200)

  expect(getRes.body).toStrictEqual({
    id: categoryId,
    name: 'Updated Name',
  })
})

test('PATCH /categories/:id with invalid id returns 400', async () => {
  const access_token = await getAccessToken()
  await request(app)
    .patch('/categories/invalid-uuid')
    .send({ name: 'Updated Name' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(400)
})

test('PATCH /categories/:id with invalid name returns 400', async () => {
  const access_token = await getAccessToken()

  const categoryRes = await request(app)
    .post('/categories')
    .send({ name: 'Old Name' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)

  const categoryId = categoryRes.body.id

  await request(app)
    .patch(`/categories/${categoryId}`)
    .send({ name: '' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(400)
})

test('PATCH /categories/:id with unknown category returns 404', async () => {
  const access_token = await getAccessToken()

  await request(app)
    .patch('/categories/00000000-0000-0000-0000-000000000000')
    .send({ name: 'Updated Name' })
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
    .send({ name: 'User 1 Category' })
    .set('Authorization', `Bearer ${access_token_user1}`)
    .expect(201)

  const user1CategoryId = categoryRes.body.id

  await request(app)
    .patch(`/categories/${user1CategoryId}`)
    .send({ name: 'Updated Name' })
    .set('Authorization', `Bearer ${access_token_user2}`)
    .expect(404)
})

test('PATCH /categories/:id with existing name returns 409', async () => {
  const access_token = await getAccessToken()

  await request(app)
    .post('/categories')
    .send({ name: 'Category 1' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)

  const categoryRes = await request(app)
    .post('/categories')
    .send({ name: 'Category 2' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)

  const category2Id = categoryRes.body.id

  await request(app)
    .patch(`/categories/${category2Id}`)
    .send({ name: 'Category 1' })
    .set('Authorization', `Bearer ${access_token}`)
    .expect(409)
})

test('DELETE /categories/:id returns 204', async () => {
  const access_token = await getAccessToken()

  const categoryRes = await request(app)
    .post('/categories')
    .send({ name: 'Category to Delete' })
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
    .send({ name: 'User 1 Category' })
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
    .send({ name: 'Category in Use' })
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

test('protected category route rejects request without authorization header', async () => {
  await request(app).get('/categories').expect(401)
})
