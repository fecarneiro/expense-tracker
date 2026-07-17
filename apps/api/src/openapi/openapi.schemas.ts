import * as z from 'zod'

export const validationErrorResponseSchema = z
  .object({
    message: z.string().meta({
      example: 'Validation error',
    }),
    errors: z.array(
      z.object({
        path: z.string().meta({
          example: 'name',
        }),
        message: z.string().meta({
          example: 'Required',
        }),
      }),
    ),
  })
  .meta({
    id: 'ValidationErrorResponse',
  })

export const errorResponseSchema = z
  .object({
    message: z.string().meta({
      example: 'Category not found',
    }),
  })
  .meta({
    id: 'ErrorResponse',
  })
