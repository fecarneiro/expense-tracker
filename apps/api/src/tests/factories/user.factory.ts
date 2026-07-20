// node -e "import('bcrypt').then(b => b.hash('12345678', 10).then(console.log))"

import type { Database } from '../../database/db.js'
import { usersTable } from '../../database/schemas/users.schema.js'
import {
  DEFAULT_USER_CURRENCY,
  DEFAULT_USER_LOCALE,
  DEFAULT_USER_TIME_ZONE,
} from '../../modules/users/user.constants.js'
import { OTHER_TEST_EMAIL, TEST_EMAIL } from '../constants.js'

export const TEST_PASSWORD_HASH = '$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

type InsertTestUserParams = {
  email?: string
  passwordHash?: string
}

export async function insertTestUser(db: Database, params: InsertTestUserParams = {}) {
  const [user] = await db
    .insert(usersTable)
    .values({
      email: params.email ?? TEST_EMAIL,
      passwordHash: params.passwordHash ?? TEST_PASSWORD_HASH,
      timeZone: DEFAULT_USER_TIME_ZONE,
      currency: DEFAULT_USER_CURRENCY,
      locale: DEFAULT_USER_LOCALE,
    })
    .returning()

  if (!user) throw new Error('insertTestUser: failed')

  return user
}

export async function insertOtherTestUser(db: Database) {
  return insertTestUser(db, { email: OTHER_TEST_EMAIL })
}
