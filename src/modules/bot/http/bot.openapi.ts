import type { ZodOpenApiPathsObject } from 'zod-openapi'
import {
  jsonResponse,
  tooManyRequestsResponse,
  unauthorizedResponse,
} from '../../../openapi/openapi.responses.js'
import { generatedLinkingCodeResponseSchema } from '../bot.schemas.js'

export const botOpenApiPaths = {
  '/bot/generate-linking-code': {
    get: {
      tags: ['Bot'],
      summary: 'Generate bot linking code',
      description: 'Creates or replaces the linking code for the authenticated user.',
      security: [{ bearerAuth: [] }],
      responses: {
        '201': jsonResponse('Bot linking code generated', generatedLinkingCodeResponseSchema),
        '401': unauthorizedResponse,
        '429': tooManyRequestsResponse,
      },
    },
  },
} satisfies ZodOpenApiPathsObject
