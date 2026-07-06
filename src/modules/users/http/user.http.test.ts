import request from 'supertest'
import { beforeAll, beforeEach, expect, test } from 'vitest'
import { createApp } from '../../../app.js'
import { createContainer } from '../../../container.js'
import type { Database } from '../../../database/db.js'
import { categoriesTable } from '../../../database/schemas/category.schema.js'
import { transactionsTable } from '../../../database/schemas/transaction.schema.js'
import { usersTable } from '../../../database/schemas/user.schema.js'
import { setupDbTest } from '../../../tests/db/setup-db-test.js'
import { getTestAccessToken } from '../../../tests/helpers/test.http.helpers.js'

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

test('GET /users/me returns 200 with authenticated user', async () => {
  const access_token = await getTestAccessToken(dbTest)

  const res = await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${access_token}`)
    .expect(200)

  expect(res.body).toEqual({
    id: expect.any(String),
    email: 'johndoe@email.com',
  })
})

test('GET /users/me does not return sensitive fields', async () => {
  const access_token = await getTestAccessToken(dbTest)

  const res = await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${access_token}`)
    .expect(200)

  expect(res.body).not.toHaveProperty('passwordHash')
})

test('GET /users/me without authorization header returns 401', async () => {
  await request(app).get('/users/me').expect(401)
})

test('PATCH /users/me/password returns 204', async () => {
  const access_token = await getTestAccessToken(dbTest)

  await request(app)
    .patch('/users/me/password')
    .set('Authorization', `Bearer ${access_token}`)
    .send({
      currentPassword: '12345678',
      newPassword: 'newPassword',
    })
    .expect(204)
})

test('PATCH /users/me/password invalidates the old password', async () => {
  const access_token = await getTestAccessToken(dbTest)

  await request(app)
    .patch('/users/me/password')
    .set('Authorization', `Bearer ${access_token}`)
    .send({
      currentPassword: '12345678',
      newPassword: 'newPassword',
    })
    .expect(204)

  await request(app)
    .post('/auth/login')
    .send({ email: 'johndoe@email.com', password: '12345678' })
    .expect(401)
})

test('PATCH /users/me/password accepts the new password for login', async () => {
  const access_token = await getTestAccessToken(dbTest)

  await request(app)
    .patch('/users/me/password')
    .set('Authorization', `Bearer ${access_token}`)
    .send({
      currentPassword: '12345678',
      newPassword: 'newPassword',
    })
    .expect(204)

  await request(app)
    .post('/auth/login')
    .send({ email: 'johndoe@email.com', password: 'newPassword' })
    .expect(200)
})

test('PATCH /users/me/password with wrong current password returns 401', async () => {
  const access_token = await getTestAccessToken(dbTest)

  await request(app)
    .patch('/users/me/password')
    .set('Authorization', `Bearer ${access_token}`)
    .send({
      currentPassword: 'wrongPassword',
      newPassword: 'newPassword',
    })
    .expect(401)

  await request(app)
    .post('/auth/login')
    .send({ email: 'johndoe@email.com', password: '12345678' })
    .expect(200)
})

test('PATCH /users/me/password with empty current password returns 400', async () => {
  const access_token = await getTestAccessToken(dbTest)

  await request(app)
    .patch('/users/me/password')
    .set('Authorization', `Bearer ${access_token}`)
    .send({
      currentPassword: '',
      newPassword: 'newPassword',
    })
    .expect(400)
})

test('PATCH /users/me/password with short new password returns 400', async () => {
  const access_token = await getTestAccessToken(dbTest)

  await request(app)
    .patch('/users/me/password')
    .set('Authorization', `Bearer ${access_token}`)
    .send({
      currentPassword: '12345678',
      newPassword: 'short',
    })
    .expect(400)
})

test('PATCH /users/me/password without authorization header returns 401', async () => {
  await request(app)
    .patch('/users/me/password')
    .send({
      currentPassword: '12345678',
      newPassword: 'newPassword',
    })
    .expect(401)
})

test('DELETE /users/me returns 204', async () => {
  const access_token = await getTestAccessToken(dbTest)

  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${access_token}`)
    .send({ password: '12345678' })
    .expect(204)
})

test('DELETE /users/me removes the user account', async () => {
  const access_token = await getTestAccessToken(dbTest)

  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${access_token}`)
    .send({ password: '12345678' })
    .expect(204)

  await request(app).get('/users/me').set('Authorization', `Bearer ${access_token}`).expect(401)

  await request(app)
    .post('/auth/login')
    .send({ email: 'johndoe@email.com', password: '12345678' })
    .expect(401)
})

test('DELETE /users/me removes user-owned categories and transactions', async () => {
  const access_token = await getTestAccessToken(dbTest)

  const categoryRes = await request(app)
    .post('/categories')
    .set('Authorization', `Bearer ${access_token}`)
    .send({ name: 'Test Category', categoryType: 'expense' })
    .expect(201)

  await request(app)
    .post('/transactions')
    .set('Authorization', `Bearer ${access_token}`)
    .send({
      occurredAt: '2026-01-01',
      amountInCents: 10050,
      transactionType: 'expense',
      categoryId: categoryRes.body.id,
    })
    .expect(201)

  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${access_token}`)
    .send({ password: '12345678' })
    .expect(204)

  const categories = await dbTest.select().from(categoriesTable)
  const transactions = await dbTest.select().from(transactionsTable)

  expect(categories).toStrictEqual([])
  expect(transactions).toStrictEqual([])
})

test('DELETE /users/me with wrong password returns 401', async () => {
  const access_token = await getTestAccessToken(dbTest)

  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${access_token}`)
    .send({ password: 'wrongPassword' })
    .expect(401)

  await request(app).get('/users/me').set('Authorization', `Bearer ${access_token}`).expect(200)
})

test('DELETE /users/me with empty password returns 400', async () => {
  const access_token = await getTestAccessToken(dbTest)

  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${access_token}`)
    .send({ password: '' })
    .expect(400)
})

test('DELETE /users/me without authorization header returns 401', async () => {
  await request(app).delete('/users/me').send({ password: '12345678' }).expect(401)
})
