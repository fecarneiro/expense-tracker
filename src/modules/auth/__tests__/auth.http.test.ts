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
    createdAt: expect.any(String), // json serializes date as string
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

test('POST /auth/login sets an httpOnly cookie', async () => {
  await request(app).post('/auth/register').send(credentials)
  const res = await request(app).post('/auth/login').send(credentials).expect(200)
  const setCookie = res.headers['set-cookie']
  expect(String(setCookie)).toMatch(/^token=/)
  expect(String(setCookie)).toMatch(/HttpOnly/i)
})

test('POST /auth/login with wrong password returns 401', async () => {
  await request(app).post('/auth/register').send(credentials)
  await request(app)
    .post('/auth/login')
    .send({ ...credentials, password: 'wrongpass' })
    .expect(401)
})

test('protected route rejects request without cookie', async () => {
  await request(app).delete('/auth/register').send(credentials).expect(401)
})

test('protected route accepts a valid session cookie', async () => {
  await request(app).post('/auth/register').send(credentials)
  const agent = request.agent(app)
  await agent.post('/auth/login').send(credentials).expect(200)
  const res = await agent.get('/users/me')
  expect(res.body).toStrictEqual({
    id: expect.any(String),
    email: credentials.email,
    createdAt: expect.any(String),
  })
})
