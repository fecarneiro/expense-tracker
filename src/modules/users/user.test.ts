import { beforeAll, beforeEach, expect, test } from 'vitest'
import { createContainer } from '../../container.js'
import type { Database } from '../../database/db.js'
import { categoriesTable } from '../../database/schemas/category.schema.js'
import { transactionsTable } from '../../database/schemas/transaction.schema.js'
import { usersTable } from '../../database/schemas/user.schema.js'
import { setupDbTest } from '../../tests/setup-db-test.js'
import { InvalidCredentialsError } from '../auth/auth.error.js'
import { AuthenticatedUserNotFoundError, EmailAlreadyInUseError } from './user.error.js'

let dbTest: Database

beforeAll(async () => {
  const setup = await setupDbTest()
  dbTest = setup.dbTest as unknown as Database

  return async () => {
    setup.client.close()
  }
})

beforeEach(async () => {
  await dbTest.delete(usersTable)
})

function sut() {
  return createContainer(dbTest)
}

function createUser() {
  const { userService } = sut()

  return userService.createWithPassword({
    email: 'johndoe@email.com',
    password: '12345678',
  })
}

test('createWithPassword returns the public user without sensitive fields', async () => {
  const created = await createUser()

  expect(created).toEqual({
    id: expect.any(String),
    email: 'johndoe@email.com',
  })
  expect(created).not.toHaveProperty('passwordHash')
})

test('createWithPassword stores a hashed password', async () => {
  await createUser()
  const [user] = await dbTest.select().from(usersTable)

  expect(user?.passwordHash).toBeDefined()
})

test('createWithPassword fails when the email is already in use', async () => {
  await createUser()
  await expect(createUser()).rejects.toThrow(new EmailAlreadyInUseError())
})

test('findByEmail returns the user when the email exists', async () => {
  const { userService } = sut()
  const created = await createUser()

  const found = await userService.findByEmail({ email: created.email })

  expect(found).toStrictEqual({
    id: expect.any(String),
    email: created.email,
    passwordHash: expect.any(String),
    createdAt: expect.any(Date),
  })
})

test('findByEmail returns null when the email does not exist', async () => {
  const { userService } = sut()

  const found = await userService.findByEmail({ email: 'nonexistent@email.com' })

  expect(found).toBeNull()
})

test('getCurrentUser returns the authenticated public user', async () => {
  const { userService } = sut()
  const created = await createUser()

  const found = await userService.getCurrentUser({ id: created.id })

  expect(found).toStrictEqual({
    id: created.id,
    email: created.email,
  })
})

test('getCurrentUser fails when the authenticated user does not exist', async () => {
  const { userService } = sut()

  await expect(userService.getCurrentUser({ id: 'nonexistent-id' })).rejects.toThrow()
})

test('changePassword updates the user password', async () => {
  const { userService } = sut()
  const created = await createUser()

  await userService.changePassword({
    id: created.id,
    currentPassword: '12345678',
    newPassword: '87654321',
  })

  const found = await userService.verifyPassword({
    email: created.email,
    password: '87654321',
  })

  expect(found).toStrictEqual({
    id: created.id,
    email: created.email,
  })
})

test('changePassword fails when the authenticated user does not exist', async () => {
  const { userService } = sut()

  await expect(
    userService.changePassword({
      id: '00000000-0000-0000-0000-000000000000',
      currentPassword: '12345678',
      newPassword: '87654321',
    }),
  ).rejects.toThrow(AuthenticatedUserNotFoundError)
})

test('changePassword fails and preserves the password when the current password is wrong', async () => {
  const { userService } = sut()
  const created = await createUser()

  await expect(
    userService.changePassword({
      id: created.id,
      currentPassword: 'wrong-password',
      newPassword: '87654321',
    }),
  ).rejects.toThrow(InvalidCredentialsError)

  const found = await userService.verifyPassword({
    email: created.email,
    password: '12345678',
  })

  expect(found).toStrictEqual({
    id: created.id,
    email: created.email,
  })
})

test('verifyPassword returns the public user with valid credentials', async () => {
  const { userService } = sut()
  const created = await createUser()

  const found = await userService.verifyPassword({
    email: created.email,
    password: '12345678',
  })

  expect(found).toStrictEqual({
    id: created.id,
    email: created.email,
  })
})

test('verifyPassword returns null when the email does not exist', async () => {
  const { userService } = sut()

  const found = await userService.verifyPassword({
    email: 'nonexistent@email.com',
    password: '12345678',
  })

  expect(found).toBeNull()
})

test('verifyPassword returns null when the password is wrong', async () => {
  const { userService } = sut()
  const created = await createUser()

  const found = await userService.verifyPassword({
    email: created.email,
    password: 'wrong-password',
  })

  expect(found).toBeNull()
})

test('delete removes the authenticated user', async () => {
  const { userService } = sut()
  const created = await createUser()

  await userService.delete({
    id: created.id,
    password: '12345678',
  })

  const found = await userService.findByEmail({ email: created.email })

  expect(found).toBeNull()
})

test('delete removes user-owned categories and transactions', async () => {
  const { userService } = sut()
  const created = await createUser()

  const [category] = await dbTest
    .insert(categoriesTable)
    .values({
      userId: created.id,
      name: 'Test Category',
      categoryType: 'expense',
    })
    .returning()

  if (!category) throw new Error('category not created')

  await dbTest.insert(transactionsTable).values({
    userId: created.id,
    categoryId: category.id,
    amountInCents: 10050,
    transactionType: 'expense',
    occurredAt: '2026-01-01',
  })

  await userService.delete({
    id: created.id,
    password: '12345678',
  })

  const foundCategories = await dbTest.select().from(categoriesTable)
  const foundTransactions = await dbTest.select().from(transactionsTable)

  expect(foundCategories).toStrictEqual([])
  expect(foundTransactions).toStrictEqual([])
})

test('delete fails when the authenticated user does not exist', async () => {
  const { userService } = sut()

  await expect(
    userService.delete({
      id: '00000000-0000-0000-0000-000000000000',
      password: '12345678',
    }),
  ).rejects.toThrow(AuthenticatedUserNotFoundError)
})

test('delete fails and preserves the user when the password is wrong', async () => {
  const { userService } = sut()
  const created = await createUser()

  await expect(
    userService.delete({
      id: created.id,
      password: 'wrong-password',
    }),
  ).rejects.toThrow(InvalidCredentialsError)

  const found = await userService.findByEmail({ email: created.email })

  expect(found).toStrictEqual({
    id: created.id,
    email: created.email,
    passwordHash: expect.any(String),
    createdAt: expect.any(Date),
  })
})
