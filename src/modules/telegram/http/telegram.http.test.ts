import request from 'supertest'
import { beforeAll, beforeEach, expect, test } from 'vitest'
import { createApp } from '../../../app.js'
import { createContainer } from '../../../container.js'
import type { Database } from '../../../database/db.js'
import { usersTable } from '../../../database/schemas/user.schema.js'
import { setupDbTest } from '../../../tests/db/setup-db-test.js'
import { getTestAccessToken } from '../../../tests/helpers/test.http.helpers.js'
import {
  LINKING_CODE_MAX_NUMBER,
  LINKING_CODE_MIN_NUMBER,
} from '../linking-code/linking-code.service.js'

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

test('GET /telegram/generate-linking-code returns 201 with linking code', async () => {
  const access_token = await getTestAccessToken(dbTest)

  const res = await request(app)
    .get('/telegram/generate-linking-code')
    .set('Authorization', `Bearer ${access_token}`)
    .expect(201)

  expect(res.body).toStrictEqual({
    code: expect.any(Number),
    createdAt: expect.any(String),
  })
  expect(res.body.code).toBeGreaterThanOrEqual(LINKING_CODE_MIN_NUMBER)
  expect(res.body.code).toBeLessThan(LINKING_CODE_MAX_NUMBER)
})

test('GET /telegram/generate-linking-code without authorization header returns 401', async () => {
  await request(app).get('/telegram/generate-linking-code').expect(401)
})
