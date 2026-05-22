import * as z from 'zod'

export const UserSchema = z.object({
  id: z.uuid(),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(6).max(20),
  createdAt: z.date(),
})

export const ChangePasswordInput = z.object({
  currentPassword: z.string().min(1),
  newPassword: UserSchema.shape.password,
})

export const CreateUserInput = UserSchema.omit({ id: true, createdAt: true })
export const UserResponse = UserSchema.omit({ password: true, createdAt: true })

export type CreateUserInput = z.infer<typeof CreateUserInput>
export type ChangePasswordInput = z.infer<typeof ChangePasswordInput>
export type UserResponse = z.infer<typeof UserResponse>
