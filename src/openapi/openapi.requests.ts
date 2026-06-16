import type { ZodType } from 'zod'

export function jsonRequestBody(schema: ZodType, required = true) {
  return {
    required,
    content: {
      'application/json': {
        schema,
      },
    },
  }
}
