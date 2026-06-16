import * as z from 'zod'

export const userIdField = z.uuid().meta({
  example: 'b3e1c9a2-7a7a-4f5a-9e0d-15b2d4c1a001',
})

export const emailField = z.string().trim().toLowerCase().max(254).pipe(z.email()).meta({
  example: 'johndoe@email.com',
})

export const passwordField = z.string().min(8).max(72).meta({
  description: 'Must be between 8 and 72 characters.',
  example: 'password123',
})

export const createUserBodySchema = z
  .strictObject({
    email: emailField,
    password: passwordField,
  })
  .meta({
    id: 'CreateUserBody',
  })

export const changePasswordBodySchema = z
  .strictObject({
    currentPassword: z.string().min(1).meta({
      example: 'oldpassword123',
    }),
    newPassword: passwordField,
  })
  .meta({
    id: 'ChangePasswordBody',
  })

export const deleteUserBodySchema = z
  .strictObject({
    password: z.string().min(1).meta({
      example: 'password123',
    }),
  })
  .meta({
    id: 'DeleteUserBody',
  })

export const userHttpResponseSchema = z
  .object({
    id: userIdField,
    email: emailField,
  })
  .meta({
    id: 'User',
  })
