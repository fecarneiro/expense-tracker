import type { ZodType } from 'zod'
import { errorResponseSchema, validationErrorResponseSchema } from './openapi.schemas.js'

export function jsonResponse(description: string, schema: ZodType) {
  return {
    description,
    content: {
      'application/json': {
        schema,
      },
    },
  }
}

export const noContentResponse = {
  description: 'No content',
}

export const validationErrorResponse = jsonResponse(
  'Validation error',
  validationErrorResponseSchema,
)

export const unauthorizedResponse = jsonResponse('Unauthorized', errorResponseSchema)

export const tooManyRequestsResponse = jsonResponse('Too many requests', errorResponseSchema)

export const notFoundResponse = (description = 'Resource not found') =>
  jsonResponse(description, errorResponseSchema)

export const conflictResponse = (description = 'Conflict') =>
  jsonResponse(description, errorResponseSchema)
