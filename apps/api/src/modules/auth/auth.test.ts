import { describe } from 'vitest'
import { TEST_EMAIL, TEST_PASSWORD } from '../../tests/constants.js'
import { expect, integrationTest as test } from '../../tests/fixtures/integration.fixture.js'
import { CATEGORY_SYSTEM_KEY, defaultCategories } from '../categories/category.defaults.js'
import { CategoryAlreadyExistsError } from '../categories/category.error.js'
import { InvalidCredentialsError } from './auth.error.js'

const registerInput = {
  email: TEST_EMAIL,
  password: TEST_PASSWORD,
} as const

describe('AuthService', () => {
  describe('register', () => {
    test('creates a user with default categories', async ({ container }) => {
      const user = await container.authService.register(registerInput)

      const userCategories = await container.categoryService.findAll({ userId: user.id })
      expect(userCategories).toHaveLength(defaultCategories.length)

      const uncategorized = await container.categoryService.findBySystemKey({
        userId: user.id,
        systemKey: CATEGORY_SYSTEM_KEY.UNCATEGORIZED,
      })
      expect(uncategorized).toMatchObject({
        userId: user.id,
        name: 'Uncategorized',
        categoryType: 'expense',
      })
      expect(uncategorized).not.toHaveProperty('systemKey')
    })

    test('fails when the default categories already exist', async ({ container, db }) => {
      const user = await container.authService.register(registerInput)

      await expect(container.categoryService.createDefaultsForUser(user.id, db)).rejects.toThrow(
        CategoryAlreadyExistsError,
      )
    })
  })

  describe('verifyCredentials', () => {
    test('returns the public user with valid credentials', async ({ container }) => {
      const user = await container.authService.register(registerInput)

      const result = await container.authService.verifyCredentials({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      })

      expect(result).toMatchObject({
        id: user.id,
        email: user.email,
      })
    })

    test('throws when the provided email is not registered', async ({ container }) => {
      await expect(
        container.authService.verifyCredentials({
          email: 'nonexistent@email.com',
          password: TEST_PASSWORD,
        }),
      ).rejects.toThrow(InvalidCredentialsError)
    })

    test('throws when the password is wrong', async ({ container }) => {
      await container.authService.register(registerInput)

      await expect(
        container.authService.verifyCredentials({
          email: TEST_EMAIL,
          password: 'wrong-password',
        }),
      ).rejects.toThrow(InvalidCredentialsError)
    })
  })
})
