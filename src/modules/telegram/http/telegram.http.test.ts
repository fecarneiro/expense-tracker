import request from 'supertest'
import { beforeAll, beforeEach, expect, test } from 'vitest'
import { createApp } from '../../../app.js'
import { createContainer } from '../../../container.js'
import type { Database } from '../../../database/db.js'
import { usersTable } from '../../../database/schemas/user.schema.js'
import { setupDbTest } from '../../../tests/setup-db-test.js'
import { MAX_CODE, MIN_CODE } from '../telegram.service.js'

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

async function getAccessToken({ email = 'johndoe@email.com', password = '12345678' } = {}) {
  const credentials = { email, password }
  await request(app).post('/auth/register').send(credentials).expect(201)
  const res = await request(app).post('/auth/login').send(credentials).expect(200)

  return res.body.access_token as string
}

test('GET /telegram/generate-linking-code returns 201 with linking code', async () => {
  const access_token = await getAccessToken()

  const res = await request(app)
    .get('/telegram/generate-linking-code')
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)

  expect(res.body).toStrictEqual({
    code: expect.any(Number),
    createdAt: expect.any(String),
  })
  expect(res.body.code).toBeGreaterThanOrEqual(MIN_CODE)
  expect(res.body.code).toBeLessThan(MAX_CODE)
})

test('GET /telegram/generate-linking-code without authorization header returns 401', async () => {
  await request(app).get('/telegram/generate-linking-code').expect(401)
})
