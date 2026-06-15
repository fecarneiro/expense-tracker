import * as z from 'zod'

export const emailField = z.string().trim().toLowerCase().max(254).pipe(z.email())

export const strongPasswordField = z.string().min(8).max(72)

// Controller Layer (HTTP bodies)

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: strongPasswordField,
})

export const deleteUserSchema = z.object({
  password: z.string().min(1),
})

// Service Layer
export type ChangePasswordData = z.infer<typeof changePasswordSchema> & {
  userId: string
}

export type DeleteUserData = z.infer<typeof deleteUserSchema> & {
  userId: string
}

// Repository Layer
export interface UpdatePasswordRepositoryData {
  userId: string
  passwordHash: string
}

export interface DeleteRepositoryData {
  userId: string
}
