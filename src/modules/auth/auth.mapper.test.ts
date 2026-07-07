import { describe, expect, test } from 'vitest'
import { accessTokenConfig } from '../../shared/access-token.js'
import { TEST_EMAIL } from '../../tests/constants.js'
import {
  DEFAULT_USER_CURRENCY,
  DEFAULT_USER_LOCALE,
  DEFAULT_USER_TIME_ZONE,
} from '../users/user.constants.js'
import type { UserResponse } from '../users/user.mapper.js'
import { toLoginResponse, toRegisterResponse } from './auth.mapper.js'

const userResponse: UserResponse = {
  id: '019e8885-153c-7c82-af4a-28a31559e01e',
  email: TEST_EMAIL,
  timeZone: DEFAULT_USER_TIME_ZONE,
  currency: DEFAULT_USER_CURRENCY,
  locale: DEFAULT_USER_LOCALE,
  lastSeenAt: null,
}

describe('toRegisterResponse', () => {
  test('maps public user to register response contract', () => {
    expect(toRegisterResponse(userResponse)).toEqual(userResponse)
  })
})

describe('toLoginResponse', () => {
  test('maps public user and access token to login response contract', () => {
    const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'

    expect(toLoginResponse(userResponse, accessToken)).toEqual({
      user: userResponse,
      access_token: accessToken,
      token_type: accessTokenConfig.tokenType,
      expires_in: accessTokenConfig.expiresInSeconds,
    })
  })
})
