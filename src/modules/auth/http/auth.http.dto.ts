import * as z from 'zod'
import { emailField, passwordField } from '../../users/http/user.http.dto.js'

export const accessTokenPayloadSchema = z.object({ userId: z.uuid() })

export const registerBodySchema = z.object({
  email: emailField,
  password: passwordField,
})

export const loginBodySchema = z.object({
  email: emailField,
  password: z.string().min(1),
})

export type RegisterUserData = z.infer<typeof registerBodySchema>
export type LoginData = z.infer<typeof loginBodySchema>
