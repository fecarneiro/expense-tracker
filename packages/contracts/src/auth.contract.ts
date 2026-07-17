import { z } from 'zod'

export const authUserSchema = z.object({
  id: z.uuid(),
  email: z.email(),

  timezone: z.string().max(100).optional(),
  currency: z.string().length(3).optional(),
  locale: z.string().max(10).optional(),

  lastSeenAt: z.iso.datetime({ offset: true }).nullable(),
})

export const loginRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

export const loginResponseSchema = z.object({
  user: authUserSchema,
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
})

export type AuthUser = z.infer<typeof authUserSchema>
export type LoginRequest = z.infer<typeof loginRequestSchema>
export type LoginResponse = z.infer<typeof loginResponseSchema>
