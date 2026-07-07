import type { ZodOpenApiPathsObject } from 'zod-openapi'
import {
  jsonResponse,
  tooManyRequestsResponse,
  unauthorizedResponse,
} from '../../../openapi/openapi.responses.js'
import { generatedLinkingCodeResponseSchema } from '../telegram.schemas.js'

export const telegramOpenApiPaths = {
  '/telegram/generate-linking-code': {
    get: {
      tags: ['Telegram'],
      summary: 'Generate Telegram linking code',
      description: 'Creates or replaces the linking code for the authenticated user.',
      security: [{ bearerAuth: [] }],
      responses: {
        '201': jsonResponse('Telegram linking code generated', generatedLinkingCodeResponseSchema),
        '401': unauthorizedResponse,
        '429': tooManyRequestsResponse,
      },
    },
  },
} satisfies ZodOpenApiPathsObject
