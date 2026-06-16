import * as z from 'zod'
import type { ZodOpenApiPathsObject } from 'zod-openapi'
import { jsonResponse } from './openapi.responses.js'

export const healthHttpResponseSchema = z
  .object({
    status: z.literal('ok'),
  })
  .meta({
    id: 'Health',
  })

export const healthOpenApiPaths = {
  '/health': {
    get: {
      tags: ['Health'],
      summary: 'Health check',
      responses: {
        '200': jsonResponse('OK', healthHttpResponseSchema),
      },
    },
  },
} satisfies ZodOpenApiPathsObject
