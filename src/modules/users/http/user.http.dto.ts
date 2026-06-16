import * as z from 'zod'

export const emailField = z.string().trim().toLowerCase().max(254).pipe(z.email()).meta({
  description: 'Email',
  example: 'johndoe@email.com',
})

export const passwordField = z.string().min(8).max(72).meta({
  description: 'Password. Must be between 8 and 72 characters.',
  example: 'password123',
})

export const createUserBodySchema = z
  .strictObject({
    email: emailField,
    password: passwordField,
  })
  .meta({
    id: 'CreateUserBody',
    description: 'Payload for creating a user',
  })

export const changePasswordBodySchema = z
  .strictObject({
    currentPassword: z.string().min(1),
    newPassword: passwordField,
  })
  .meta({
    id: 'ChangePasswordBody',
    description: 'Payload for changing password',
  })

export const deleteUserSchema = z
  .strictObject({
    password: z.string().min(1),
  })
  .meta({
    id: 'DeleteUserBody',
    description: 'Payload for deleting a user',
  })

export const userHttpResponseSchema = z
  .object({
    id: z.uuid().meta({
      description: 'User unique identifier',
      example: 'b3e1c9a2-7a7a-4f5a-9e0d-15b2d4c1a001',
    }),
    email: emailField,
  })
  .meta({
    id: 'User',
    description: 'User returned by the API',
  })
