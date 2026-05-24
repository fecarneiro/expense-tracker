import * as z from 'zod'

const userIdField = z.uuid()

export const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email())

export const strongPasswordField = z.string().min(8).max(72)

// HTTP params
export const userIdParamsSchema = userIdField

// Controller Layer (HTTP bodies)

export const createUserSchema = z.object({
  email: emailField,
  password: strongPasswordField,
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: strongPasswordField,
})

// Service Layer
export type CreateUserData = z.infer<typeof createUserSchema>
export type ChangePasswordData = z.infer<typeof changePasswordSchema> & {
  userId: string
}

export interface DeleteUserData {
  userId: string
}

// Repository Layer
export interface UpdatePasswordRepositoryData {
  userId: string
  passwordHash: string
}

export interface DeleteUserRepositoryData {
  userId: string
}
