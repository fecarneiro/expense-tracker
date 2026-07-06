import type { ZodOpenApiPathsObject } from 'zod-openapi'
import { jsonRequestBody } from '../../../openapi/openapi.requests.js'
import {
  jsonResponse,
  noContentResponse,
  tooManyRequestsResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from '../../../openapi/openapi.responses.js'
import {
  changePasswordBodySchema,
  deleteUserBodySchema,
  userResponseSchema,
} from '../user.schemas.js'

export const userOpenApiPaths = {
  '/users/me': {
    get: {
      tags: ['Users'],
      summary: 'Get current user',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': jsonResponse('Current user', userResponseSchema),
        '401': unauthorizedResponse,
        '429': tooManyRequestsResponse,
      },
    },

    delete: {
      tags: ['Users'],
      summary: 'Delete current user',
      description: 'Deletes the authenticated user after password confirmation.',
      security: [{ bearerAuth: [] }],
      requestBody: jsonRequestBody(deleteUserBodySchema),
      responses: {
        '204': noContentResponse,
        '400': validationErrorResponse,
        '401': unauthorizedResponse,
        '429': tooManyRequestsResponse,
      },
    },
  },

  '/users/me/password': {
    patch: {
      tags: ['Users'],
      summary: 'Change password',
      description: 'Changes the authenticated user password after validating the current password.',
      security: [{ bearerAuth: [] }],
      requestBody: jsonRequestBody(changePasswordBodySchema),
      responses: {
        '204': noContentResponse,
        '400': validationErrorResponse,
        '401': unauthorizedResponse,
        '429': tooManyRequestsResponse,
      },
    },
  },
} satisfies ZodOpenApiPathsObject
