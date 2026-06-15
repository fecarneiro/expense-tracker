import request from 'supertest'
import { beforeAll, beforeEach, expect, test } from 'vitest'
import { createApp } from '../../../app.js'
import { createContainer } from '../../../container.js'
import type { Database } from '../../../database/db.js'
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
  await dbTest.delete(usersTable)
})

const credentials = {
  email: 'johndoe@email.com',
  password: '12345678',
}

async function registerUser() {
  return request(app).post('/auth/register').send(credentials).expect(201)
}

async function loginUser() {
  return request(app).post('/auth/login').send(credentials).expect(200)
}

test('POST /auth/register returns 201 without sensitive fields', async () => {
  const res = await registerUser()

  expect(res.body).toStrictEqual({
    id: expect.any(String),
    email: credentials.email,
  })
})

test('POST /auth/register with invalid email returns 400', async () => {
  await request(app)
    .post('/auth/register')
    .send({ email: 'invalid-email', password: credentials.password })
    .expect(400)
})

test('POST /auth/register with existing email returns 409', async () => {
  await registerUser()

  await request(app).post('/auth/register').send(credentials).expect(409)
})

test('POST /auth/login returns 200 with access token', async () => {
  await registerUser()

  const res = await loginUser()

  expect(res.body).toStrictEqual({
    user: {
      id: expect.any(String),
      email: credentials.email,
    },
    access_token: expect.any(String),
    token_type: 'Bearer',
    expires_in: 60 * 60 * 2,
  })
})

test('POST /auth/login with unknown email returns 401', async () => {
  await request(app).post('/auth/login').send(credentials).expect(401)
})

test('POST /auth/login with wrong password returns 401', async () => {
  await registerUser()

  await request(app)
    .post('/auth/login')
    .send({ ...credentials, password: 'wrong-password' })
    .expect(401)
})

test('protected route rejects request without authorization header', async () => {
  await request(app).get('/users/me').expect(401)
})

test('protected route rejects authorization header without token', async () => {
  await request(app).get('/users/me').set('Authorization', 'Bearer').expect(401)
})

test('protected route rejects authorization header with invalid scheme', async () => {
  await request(app).get('/users/me').set('Authorization', 'Basic token').expect(401)
})

test('protected route rejects an invalid bearer token', async () => {
  await request(app).get('/users/me').set('Authorization', 'Bearer invalid-token').expect(401)
})

test('protected route accepts a valid bearer token', async () => {
  await registerUser()

  const res = await loginUser()
  const { access_token } = res.body

  await request(app).get('/users/me').set('Authorization', `Bearer ${access_token}`).expect(200)
})

test('protected route accepts a lowercase bearer scheme', async () => {
  await registerUser()

  const res = await loginUser()
  const { access_token } = res.body

  await request(app).get('/users/me').set('Authorization', `bearer ${access_token}`).expect(200)
})
