import * as z from 'zod'
import { UserSchema } from '../users/user.dto.js'

export const SignInCredentials = z.object({
  email: UserSchema.shape.email,
  password: z.string().min(1),
})

export const AuthResponse = UserSchema.omit({ password: true, createdAt: true })

export type SignInCredentials = z.infer<typeof SignInCredentials>
export type AuthResponse = z.infer<typeof AuthResponse>
