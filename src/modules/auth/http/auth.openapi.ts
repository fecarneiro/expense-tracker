import type { ZodOpenApiPathsObject } from 'zod-openapi'
import { jsonRequestBody } from '../../../openapi/openapi.requests.js'
import {
  conflictResponse,
  jsonResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from '../../../openapi/openapi.responses.js'
import {
  loginBodySchema,
  loginHttpResponseSchema,
  registerBodySchema,
  registerHttpResponseSchema,
} from './auth.http.dto.js'

export const authOpenApiPaths = {
  '/auth/register': {
    post: {
      tags: ['Auth'],
      summary: 'Register a user',
      requestBody: jsonRequestBody(registerBodySchema),
      responses: {
        '201': jsonResponse('User registered', registerHttpResponseSchema),
        '400': validationErrorResponse,
        '409': conflictResponse('Email already exists'),
      },
    },
  },

  '/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Login',
      requestBody: jsonRequestBody(loginBodySchema),
      responses: {
        '200': jsonResponse('Authenticated user', loginHttpResponseSchema),
        '400': validationErrorResponse,
        '401': unauthorizedResponse,
      },
    },
  },
} satisfies ZodOpenApiPathsObject
