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

test('POST /auth/register returns 201 without sensitive fields', async () => {
  const res = await request(app).post('/auth/register').send(credentials).expect(201)

  expect(res.body).toStrictEqual({
    id: expect.any(String),
    email: credentials.email,
  })
})

test('POST /auth/register with invalid email returns 400', async () => {
  await request(app)
    .post('/auth/register')
    .send({ email: 'invalid-email', password: '12345678' })
    .expect(400)
})

test('POST /auth/register with existing email returns 409', async () => {
  await request(app).post('/auth/register').send(credentials)
  await request(app).post('/auth/register').send(credentials).expect(409)
})

test('POST /auth/login with wrong password returns 401', async () => {
  await request(app).post('/auth/register').send(credentials)
  await request(app)
    .post('/auth/login')
    .send({ ...credentials, password: 'wrongpass' })
    .expect(401)
})

test('protected route rejects request without authorization header', async () => {
  await request(app).get('/users/me').expect(401)
})

test('protected route accepts a valid authorization header', async () => {
  await request(app).post('/auth/register').send(credentials)
  const agent = request.agent(app)
  const res = await agent.post('/auth/login').send(credentials).expect(200)
  const { access_token } = res.body

  await agent.get('/users/me').set('Authorization', `Bearer ${access_token}`).expect(200)

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
