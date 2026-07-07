import { describe } from 'vitest'
import type { createContainer } from '../../container.js'
import { categoriesTable } from '../../database/schemas/category.schema.js'
import { transactionsTable } from '../../database/schemas/transaction.schema.js'
import { usersTable } from '../../database/schemas/user.schema.js'
import {
  TEST_EMAIL,
  TEST_OCCURRED_AT_DATE,
  TEST_PASSWORD,
  UNKNOWN_UUID,
} from '../../tests/constants.js'
import { expect, integrationTest as test } from '../../tests/fixtures/integration.fixture.js'
import { InvalidCredentialsError } from '../auth/auth.error.js'
import { AuthenticatedUserNotFoundError, EmailAlreadyInUseError } from './user.error.js'

async function createUser(container: ReturnType<typeof createContainer>) {
  return container.userService.createWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  })
}

describe('UserService', () => {
  describe('createWithPassword', () => {
    test('returns the public user without sensitive fields', async ({ container }) => {
      const created = await createUser(container)

      expect(created).toMatchObject({
        id: expect.any(String),
        email: TEST_EMAIL,
      })
      expect(created).not.toHaveProperty('passwordHash')
    })

    test('stores a hashed password', async ({ container, db }) => {
      const created = await createUser(container)
      const [user] = await db.select().from(usersTable)

      expect(user?.id).toBe(created.id)
      expect(user?.passwordHash).toBeDefined()
    })

    test('throws when the email is already in use', async ({ container }) => {
      await createUser(container)
      await expect(createUser(container)).rejects.toThrow(EmailAlreadyInUseError)
    })
  })

  describe('findByEmail', () => {
    test('returns the user when the email exists', async ({ container }) => {
      const created = await createUser(container)

      const found = await container.userService.findByEmail({ email: created.email })

      expect(found).toMatchObject({
        id: created.id,
        email: created.email,
        passwordHash: expect.any(String),
        createdAt: expect.any(Date),
      })
    })

    test('returns null when the email does not exist', async ({ container }) => {
      const found = await container.userService.findByEmail({ email: 'nonexistent@email.com' })

      expect(found).toBeNull()
    })
  })

  describe('getCurrentUser', () => {
    test('returns the authenticated public user', async ({ container }) => {
      const created = await createUser(container)

      const found = await container.userService.getCurrentUser({ id: created.id })

      expect(found).toMatchObject({
        id: created.id,
        email: created.email,
      })
    })

    test('throws when the authenticated user does not exist', async ({ container }) => {
      await expect(container.userService.getCurrentUser({ id: UNKNOWN_UUID })).rejects.toThrow(
        AuthenticatedUserNotFoundError,
      )
    })
  })

  describe('getUserPreferences', () => {
    test('returns user preferences', async ({ container }) => {
      const created = await createUser(container)

      const preferences = await container.userService.getUserPreferences({ id: created.id })

      expect(preferences).toMatchObject({
        timeZone: expect.any(String),
        locale: expect.any(String),
        currency: expect.any(String),
      })
    })
  })

  describe('changePassword', () => {
    test('updates the user password', async ({ container }) => {
      const created = await createUser(container)

      await container.userService.changePassword({
        id: created.id,
        currentPassword: TEST_PASSWORD,
        newPassword: '87654321',
      })

      const found = await container.userService.verifyPassword({
        email: created.email,
        password: '87654321',
      })

      expect(found).toMatchObject({
        id: created.id,
        email: created.email,
      })
    })

    test('throws when the authenticated user does not exist', async ({ container }) => {
      await expect(
        container.userService.changePassword({
          id: UNKNOWN_UUID,
          currentPassword: TEST_PASSWORD,
          newPassword: '87654321',
        }),
      ).rejects.toThrow(AuthenticatedUserNotFoundError)
    })

    test('throws and preserves the password when the current password is wrong', async ({
      container,
    }) => {
      const created = await createUser(container)

      await expect(
        container.userService.changePassword({
          id: created.id,
          currentPassword: 'wrong-password',
          newPassword: '87654321',
        }),
      ).rejects.toThrow(InvalidCredentialsError)

      const found = await container.userService.verifyPassword({
        email: created.email,
        password: TEST_PASSWORD,
      })

      expect(found).toMatchObject({
        id: created.id,
        email: created.email,
      })
    })
  })

  describe('verifyPassword', () => {
    test('returns the public user with valid credentials', async ({ container }) => {
      const created = await createUser(container)

      const found = await container.userService.verifyPassword({
        email: created.email,
        password: TEST_PASSWORD,
      })

      expect(found).toMatchObject({
        id: created.id,
        email: created.email,
      })
    })

    test('returns null when the email does not exist', async ({ container }) => {
      const found = await container.userService.verifyPassword({
        email: 'nonexistent@email.com',
        password: TEST_PASSWORD,
      })

      expect(found).toBeNull()
    })

    test('returns null when the password is wrong', async ({ container }) => {
      const created = await createUser(container)

      const found = await container.userService.verifyPassword({
        email: created.email,
        password: 'wrong-password',
      })

      expect(found).toBeNull()
    })
  })

  describe('delete', () => {
    test('removes the authenticated user', async ({ container }) => {
      const created = await createUser(container)

      await container.userService.delete({
        id: created.id,
        password: TEST_PASSWORD,
      })

      const found = await container.userService.findByEmail({ email: created.email })

      expect(found).toBeNull()
    })

    test('removes user-owned categories and transactions', async ({ container, db }) => {
      const created = await createUser(container)

      const [category] = await db
        .insert(categoriesTable)
        .values({
          userId: created.id,
          name: 'Test Category',
          categoryType: 'expense',
        })
        .returning()

      if (!category) throw new Error('category not created')

      await db.insert(transactionsTable).values({
        userId: created.id,
        createdByUserId: created.id,
        categoryId: category.id,
        amountInCents: 10050,
        transactionType: 'expense',
        occurredAt: TEST_OCCURRED_AT_DATE,
      })

      await container.userService.delete({
        id: created.id,
        password: TEST_PASSWORD,
      })

      const foundCategories = await db.select().from(categoriesTable)
      const foundTransactions = await db.select().from(transactionsTable)

      expect(foundCategories).toEqual([])
      expect(foundTransactions).toEqual([])
    })

    test('throws when the authenticated user does not exist', async ({ container }) => {
      await expect(
        container.userService.delete({
          id: UNKNOWN_UUID,
          password: TEST_PASSWORD,
        }),
      ).rejects.toThrow(AuthenticatedUserNotFoundError)
    })

    test('throws and preserves the user when the password is wrong', async ({ container }) => {
      const created = await createUser(container)

      await expect(
        container.userService.delete({
          id: created.id,
          password: 'wrong-password',
        }),
      ).rejects.toThrow(InvalidCredentialsError)

      const found = await container.userService.findByEmail({ email: created.email })

      expect(found).toMatchObject({
        id: created.id,
        email: created.email,
        passwordHash: expect.any(String),
        createdAt: expect.any(Date),
      })
    })
  })
})
