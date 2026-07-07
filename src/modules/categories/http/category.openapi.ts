import type { ZodOpenApiPathsObject } from 'zod-openapi'
import { jsonRequestBody } from '../../../openapi/openapi.requests.js'
import {
  conflictResponse,
  jsonResponse,
  noContentResponse,
  notFoundResponse,
  tooManyRequestsResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from '../../../openapi/openapi.responses.js'
import {
  categoriesResponseSchema,
  categoryIdParamsSchema,
  categoryResponseSchema,
  categoryTypeQuerySchema,
  createCategoryBodySchema,
  updateCategoryBodySchema,
} from '../category.schemas.js'

export const categoryOpenApiPaths = {
  '/categories': {
    post: {
      tags: ['Categories'],
      summary: 'Create a category',
      security: [{ bearerAuth: [] }],
      requestBody: jsonRequestBody(createCategoryBodySchema),
      responses: {
        '201': jsonResponse('Category created', categoryResponseSchema),
        '400': validationErrorResponse,
        '401': unauthorizedResponse,
        '409': conflictResponse('Category already exists'),
        '429': tooManyRequestsResponse,
      },
    },

    get: {
      tags: ['Categories'],
      summary: 'List categories',
      security: [{ bearerAuth: [] }],
      requestParams: {
        query: categoryTypeQuerySchema,
      },
      responses: {
        '200': jsonResponse('Category list', categoriesResponseSchema),
        '400': validationErrorResponse,
        '401': unauthorizedResponse,
        '429': tooManyRequestsResponse,
      },
    },
  },

  '/categories/{id}': {
    get: {
      tags: ['Categories'],
      summary: 'Get a category',
      security: [{ bearerAuth: [] }],
      requestParams: {
        path: categoryIdParamsSchema,
      },
      responses: {
        '200': jsonResponse('Category found', categoryResponseSchema),
        '400': validationErrorResponse,
        '401': unauthorizedResponse,
        '404': notFoundResponse('Category not found'),
        '429': tooManyRequestsResponse,
      },
    },

    patch: {
      tags: ['Categories'],
      summary: 'Update a category',
      security: [{ bearerAuth: [] }],
      requestParams: {
        path: categoryIdParamsSchema,
      },
      requestBody: jsonRequestBody(updateCategoryBodySchema),
      responses: {
        '200': jsonResponse('Category updated', categoryResponseSchema),
        '400': validationErrorResponse,
        '401': unauthorizedResponse,
        '404': notFoundResponse('Category not found'),
        '409': conflictResponse('Category already exists'),
        '429': tooManyRequestsResponse,
      },
    },

    delete: {
      tags: ['Categories'],
      summary: 'Delete a category',
      description: 'Only categories that are not used by transactions can be deleted.',
      security: [{ bearerAuth: [] }],
      requestParams: {
        path: categoryIdParamsSchema,
      },
      responses: {
        '204': noContentResponse,
        '400': validationErrorResponse,
        '401': unauthorizedResponse,
        '404': notFoundResponse('Category not found'),
        '409': conflictResponse('Category in use'),
        '429': tooManyRequestsResponse,
      },
    },
  },
} satisfies ZodOpenApiPathsObject
