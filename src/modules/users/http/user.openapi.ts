import type { ZodOpenApiPathsObject } from 'zod-openapi'
import {
  errorResponseSchema,
  validationErrorResponseSchema,
} from '../../../openapi/openapi.schemas.js'
import {
  changePasswordBodySchema,
  deleteUserSchema,
  userHttpResponseSchema,
} from './user.http.dto.js'

export const userOpenApiPaths = {
  '/users/me': {
    get: {
      tags: ['Users'],
      summary: 'Get current user',
      description: 'Returns the authenticated user profile.',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'Current user',
          content: {
            'application/json': {
              schema: userHttpResponseSchema,
            },
          },
        },
        '401': {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: errorResponseSchema,
            },
          },
        },
      },
    },

    delete: {
      tags: ['Users'],
      summary: 'Delete current user',
      description: 'Deletes the authenticated user after password confirmation.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: deleteUserSchema,
          },
        },
      },
      responses: {
        '204': {
          description: 'User deleted',
        },
        '400': {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: validationErrorResponseSchema,
            },
          },
        },
        '401': {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: errorResponseSchema,
            },
          },
        },
      },
    },
  },

  '/users/me/password': {
    patch: {
      tags: ['Users'],
      summary: 'Change password',
      description: 'Changes the authenticated user password after validating the current password.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: changePasswordBodySchema,
          },
        },
      },
      responses: {
        '204': {
          description: 'Password changed',
        },
        '400': {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: validationErrorResponseSchema,
            },
          },
        },
        '401': {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: errorResponseSchema,
            },
          },
        },
      },
    },
  },
} satisfies ZodOpenApiPathsObject
