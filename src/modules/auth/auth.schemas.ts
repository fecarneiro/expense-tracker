import * as z from 'zod'
import { emailField } from '../users/user.schemas.js'

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1),
})

export type LoginData = z.infer<typeof loginSchema>
