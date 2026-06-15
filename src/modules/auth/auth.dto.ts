import * as z from 'zod'
import { emailField, strongPasswordField } from '../users/http/user.http.dto.js'

export const accessTokenPayloadSchema = z.object({ userId: z.uuid() })

export const registerSchema = z.object({
  email: emailField,
  password: strongPasswordField,
})

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1),
})

export type RegisterUserData = z.infer<typeof registerSchema>
export type LoginData = z.infer<typeof loginSchema>
