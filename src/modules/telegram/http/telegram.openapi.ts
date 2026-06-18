import type { ZodOpenApiPathsObject } from 'zod-openapi'
import { jsonResponse, unauthorizedResponse } from '../../../openapi/openapi.responses.js'
import { generatedLinkingCodeHttpResponseSchema } from './telegram.http.dto.js'

export const telegramOpenApiPaths = {
  '/telegram/generate-linking-code': {
    get: {
      tags: ['Telegram'],
      summary: 'Generate Telegram linking code',
      description: 'Creates or replaces the linking code for the authenticated user.',
      security: [{ bearerAuth: [] }],
      responses: {
        '201': jsonResponse(
          'Telegram linking code generated',
          generatedLinkingCodeHttpResponseSchema,
        ),
        '401': unauthorizedResponse,
      },
    },
  },
} satisfies ZodOpenApiPathsObject
