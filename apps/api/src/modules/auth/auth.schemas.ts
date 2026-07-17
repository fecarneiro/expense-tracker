import { loginRequestSchema, loginResponseSchema } from '@expense-tracker/contracts'
import { z } from 'zod'
import { userCredentialsBodySchema, userResponseSchema } from '../users/user.schemas.js'

export const accessTokenPayloadSchema = z.object({ userId: z.uuid() })

export const registerBodySchema = userCredentialsBodySchema

export const loginBodySchema = loginRequestSchema

export { loginResponseSchema }

export const registerResponseSchema = userResponseSchema

export type RegisterBodyInput = z.input<typeof registerBodySchema>
export type LoginBodyInput = z.input<typeof loginBodySchema>
