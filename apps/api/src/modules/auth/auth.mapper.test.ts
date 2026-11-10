import type { AuthUser } from '@expense-tracker/contracts'
import {
  DEFAULT_USER_CURRENCY,
  DEFAULT_USER_LOCALE,
  DEFAULT_USER_TIME_ZONE,
} from '@expense-tracker/contracts'
import { describe, expect, test } from 'vitest'
import { accessTokenConfig } from '../../shared/access-token.js'
import { TEST_EMAIL } from '../../tests/constants.js'
import { toLoginResponse } from './auth.mapper.js'

const userResponse: AuthUser = {
  id: '019e8885-153c-7c82-af4a-28a31559e01e',
  email: TEST_EMAIL,
  timezone: DEFAULT_USER_TIME_ZONE,
  currency: DEFAULT_USER_CURRENCY,
  locale: DEFAULT_USER_LOCALE,
  lastSeenAt: null,
}

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
