import type { ZodOpenApiPathsObject } from 'zod-openapi'
import { jsonRequestBody } from '../../../openapi/openapi.requests.js'
import {
  conflictResponse,
  jsonResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from '../../../openapi/openapi.responses.js'
import {
  generatedLinkingCodeHttpResponseSchema,
  linkTelegramAccountBodySchema,
  telegramHttpResponseSchema,
} from './telegram.http.dto.js'

export const telegramOpenApiPaths = {
  '/telegram/link-account': {
    post: {
      tags: ['Telegram'],
      summary: 'Link Telegram account',
      security: [{ bearerAuth: [] }],
      requestBody: jsonRequestBody(linkTelegramAccountBodySchema),
      responses: {
        '201': jsonResponse('Telegram account linked', telegramHttpResponseSchema),
        '400': validationErrorResponse,
        '401': unauthorizedResponse,
        '409': conflictResponse('Telegram account already exists'),
      },
    },
  },

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
