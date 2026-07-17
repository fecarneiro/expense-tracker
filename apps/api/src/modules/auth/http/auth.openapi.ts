import type { ZodOpenApiPathsObject } from 'zod-openapi'
import { jsonRequestBody } from '../../../openapi/openapi.requests.js'
import {
  conflictResponse,
  jsonResponse,
  tooManyRequestsResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from '../../../openapi/openapi.responses.js'
import {
  loginBodySchema,
  loginResponseSchema,
  registerBodySchema,
  registerResponseSchema,
} from '../auth.schemas.js'

export const authOpenApiPaths = {
  '/auth/register': {
    post: {
      tags: ['Auth'],
      summary: 'Register a user',
      requestBody: jsonRequestBody(registerBodySchema),
      responses: {
        '201': jsonResponse('User registered', registerResponseSchema),
        '400': validationErrorResponse,
        '409': conflictResponse('Email already exists'),
        '429': tooManyRequestsResponse,
      },
    },
  },

  '/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Login',
      requestBody: jsonRequestBody(loginBodySchema),
      responses: {
        '200': jsonResponse('Authenticated user', loginResponseSchema),
        '400': validationErrorResponse,
        '401': unauthorizedResponse,
        '429': tooManyRequestsResponse,
      },
    },
  },
} satisfies ZodOpenApiPathsObject
