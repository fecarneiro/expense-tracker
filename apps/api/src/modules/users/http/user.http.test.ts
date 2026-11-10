import request from 'supertest'
import { describe, expect } from 'vitest'
import { TEST_EMAIL, TEST_PASSWORD } from '../../../tests/constants.js'
import { httpTest as test } from '../../../tests/fixtures/http.fixture.js'
import { sendUnauthorized } from '../../../tests/helpers/http-request.helpers.js'
import type { ChangePasswordBodyInput, DeleteUserBodyInput } from '../user.schemas.js'

const NEW_PASSWORD = 'newPassword1'

const DEFAULT_CHANGE_PASSWORD = {
  currentPassword: TEST_PASSWORD,
  newPassword: NEW_PASSWORD,
} as const satisfies ChangePasswordBodyInput

const DEFAULT_DELETE_BODY = {
  password: TEST_PASSWORD,
} as const satisfies DeleteUserBodyInput

describe('authorization', () => {
  test.for([
    ['GET /api/users/me', 'get', '/api/users/me'],
    ['PATCH /api/users/me/password', 'patch', '/api/users/me/password', DEFAULT_CHANGE_PASSWORD],
    ['DELETE /api/users/me', 'delete', '/api/users/me', DEFAULT_DELETE_BODY],
  ] as const)(
    '%s returns 401 without authorization header',
    async ([_route, method, path, body], { app }) => {
      await sendUnauthorized(app, method, path, body).expect(401)
    },
  )
})

describe('GET /api/users/me', () => {
  test('returns 200 with authenticated user', async ({ app, authenticateWithPassword }) => {
    const { token, user } = await authenticateWithPassword()

    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(res.body).toMatchObject({
      id: user.id,
      email: TEST_EMAIL,
    })
    expect(res.body).not.toHaveProperty('passwordHash')
  })
})

describe('PATCH /api/users/me/password', () => {
  test('returns 204 when password is changed', async ({ app, authenticateWithPassword }) => {
    const { token } = await authenticateWithPassword()

    await request(app)
      .patch('/api/users/me/password')
      .set('Authorization', `Bearer ${token}`)
      .send(DEFAULT_CHANGE_PASSWORD)
      .expect(204)
  })

  test('returns 401 with wrong current password', async ({ app, authenticateWithPassword }) => {
    const { token } = await authenticateWithPassword()

    await request(app)
      .patch('/api/users/me/password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'wrongPassword',
        newPassword: NEW_PASSWORD,
      })
      .expect(401)
  })

  test.for([
    ['empty current password', { currentPassword: '', newPassword: NEW_PASSWORD }],
    ['short new password', { currentPassword: TEST_PASSWORD, newPassword: 'short' }],
  ])('returns 400 when %s', async ([_label, body], { app, authenticateWithPassword }) => {
    const { token } = await authenticateWithPassword()

    await request(app)
      .patch('/api/users/me/password')
      .set('Authorization', `Bearer ${token}`)
      .send(body)
      .expect(400)
  })
})

describe('DELETE /api/users/me', () => {
  test('returns 204 when user is deleted', async ({ app, authenticateWithPassword }) => {
    const { token } = await authenticateWithPassword()

    await request(app)
      .delete('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send(DEFAULT_DELETE_BODY)
      .expect(204)
  })

  test('returns 401 with wrong password', async ({ app, authenticateWithPassword }) => {
    const { token } = await authenticateWithPassword()

    await request(app)
      .delete('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'wrongPassword' })
      .expect(401)
  })

  test('returns 400 when password is empty', async ({ app, authenticateWithPassword }) => {
    const { token } = await authenticateWithPassword()

    await request(app)
      .delete('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: '' })
      .expect(400)
  })
})
