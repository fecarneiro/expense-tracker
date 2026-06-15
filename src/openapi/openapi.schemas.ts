import * as z from 'zod'

export const validationErrorResponseSchema = z
  .object({
    message: z.string().meta({
      description: 'Human-readable validation error summary',
      example: 'Validation error',
    }),
    errors: z.array(
      z.object({
        path: z.string().meta({
          description: 'Field path that failed validation',
          example: 'name',
        }),
        message: z.string().meta({
          description: 'Validation error message for the field',
          example: 'Required',
        }),
      }),
    ),
  })
  .meta({
    id: 'ValidationErrorResponse',
    description: 'Validation error response',
  })

export const errorResponseSchema = z
  .object({
    message: z.string().meta({
      description: 'Human-readable error message',
      example: 'Category not found',
    }),
  })
  .meta({
    id: 'ErrorResponse',
    description: 'Generic error response',
  })
