import { createContainer } from '../../container.js'
import type { Database } from '../../database/db.js'
import { generateToken } from '../../shared/access-token.js'

type GetAccessTokenParams = {
  email?: string
  password?: string
}

/**
 * Creates a user without default categories and returns a JWT for HTTP tests.
 * Prefer this over POST /auth/register in modules that only need authentication.
 */
export async function getTestAccessToken(dbTest: Database, params?: GetAccessTokenParams) {
  const { email, password } = {
    email: 'johndoe@email.com',
    password: '12345678',
    ...params,
  }

  const container = createContainer(dbTest)
  const user = await container.userService.createWithPassword({ email, password })

  return generateToken({ id: user.id })
}
