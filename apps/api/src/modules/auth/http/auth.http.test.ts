import request from 'supertest'
import { describe, expect } from 'vitest'
import { accessTokenConfig } from '../../../shared/access-token.js'
import { TEST_EMAIL, TEST_PASSWORD } from '../../../tests/constants.js'
import { httpTest as test } from '../../../tests/fixtures/http.fixture.js'
import type { HttpTestApp } from '../../../tests/helpers/http-request.helpers.js'
import type { LoginBodyInput, RegisterBodyInput } from '../auth.schemas.js'

const registerCredentials = {
  email: TEST_EMAIL,
  password: TEST_PASSWORD,
} as const satisfies RegisterBodyInput

const loginCredentials = {
  email: TEST_EMAIL,
  password: TEST_PASSWORD,
} as const satisfies LoginBodyInput

async function registerUser(app: HttpTestApp, credentials = registerCredentials) {
  return request(app).post('/auth/register').send(credentials).expect(201)
}

async function loginUser(app: HttpTestApp, credentials = loginCredentials) {
  return request(app).post('/auth/login').send(credentials).expect(200)
}

describe('POST /auth/register', () => {
  test('returns 201 without sensitive fields', async ({ app }) => {
    const res = await registerUser(app)

    expect(res.body).toMatchObject({
      id: expect.any(String),
      email: TEST_EMAIL,
    })
    expect(res.body).not.toHaveProperty('passwordHash')
  })

  test('returns 409 when email is already in use', async ({ app }) => {
    await registerUser(app)

    await request(app).post('/auth/register').send(registerCredentials).expect(409)
  })

  test.for([
    ['invalid email', { email: 'invalid-email', password: TEST_PASSWORD }],
    ['short password', { email: TEST_EMAIL, password: '123456' }],
    ['extra field (strictObject)', { ...registerCredentials, hacker: true }],
  ])('returns 400 when %s', async ([_label, body], { app }) => {
    await request(app).post('/auth/register').send(body).expect(400)
  })
})

describe('POST /auth/login', () => {
  test('returns 200 with access token', async ({ app }) => {
    await registerUser(app)

    const res = await loginUser(app)

    expect(res.body).toMatchObject({
      user: {
        id: expect.any(String),
        email: TEST_EMAIL,
      },
      access_token: expect.any(String),
      token_type: accessTokenConfig.tokenType,
      expires_in: accessTokenConfig.expiresInSeconds,
    })
  })

  test('returns 401 with unknown email', async ({ app }) => {
    await request(app).post('/auth/login').send(loginCredentials).expect(401)
  })

  test('returns 401 with wrong password', async ({ app }) => {
    await registerUser(app)

    await request(app)
      .post('/auth/login')
      .send({ ...loginCredentials, password: 'wrong-password' })
      .expect(401)
  })

  test.for([
    ['invalid email', { email: 'invalid-email', password: TEST_PASSWORD }],
    ['empty password', { email: TEST_EMAIL, password: '' }],
  ])('returns 400 when %s', async ([_label, body], { app }) => {
    await request(app).post('/auth/login').send(body).expect(400)
  })
})

describe('JWT middleware', () => {
  test.for([
    ['authorization header without token', 'Bearer'],
    ['invalid authorization scheme', 'Basic token'],
    ['invalid bearer token', 'Bearer invalid-token'],
  ] as const)('rejects %s', async ([_label, authorization], { app }) => {
    await request(app).get('/users/me').set('Authorization', authorization).expect(401)
  })

  test('accepts a valid bearer token', async ({ app }) => {
    await registerUser(app)

    const { body } = await loginUser(app)

    await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${body.access_token}`)
      .expect(200)
  })

  test('accepts a lowercase bearer scheme', async ({ app }) => {
    await registerUser(app)

    const { body } = await loginUser(app)

    await request(app)
      .get('/users/me')
      .set('Authorization', `bearer ${body.access_token}`)
      .expect(200)
  })
})
