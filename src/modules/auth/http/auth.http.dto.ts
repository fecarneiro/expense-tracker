import * as z from 'zod'
import {
  emailField,
  userCredentialsBodySchema,
  userResponseSchema,
} from '../../users/user.schemas.js'

export const accessTokenPayloadSchema = z.object({ userId: z.uuid() })

export const registerBodySchema = userCredentialsBodySchema.meta({
  id: 'RegisterBody',
})

export const loginBodySchema = z
  .strictObject({
    email: emailField,
    password: z.string().min(1),
  })
  .meta({
    id: 'LoginBody',
  })

export const registerHttpResponseSchema = userResponseSchema

export const loginHttpResponseSchema = z
  .object({
    user: userResponseSchema,
    access_token: z.string().meta({
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp3AbJ9',
    }),
    token_type: z.string().meta({
      example: 'Bearer',
    }),
    expires_in: z.number().meta({
      example: 7200,
    }),
  })
  .meta({
    id: 'LoginHttpResponse',
  })
