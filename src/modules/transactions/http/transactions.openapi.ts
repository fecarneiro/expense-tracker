import type { ZodOpenApiPathsObject } from 'zod-openapi'
import { jsonRequestBody } from '../../../openapi/openapi.requests.js'
import {
  jsonResponse,
  noContentResponse,
  notFoundResponse,
  tooManyRequestsResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from '../../../openapi/openapi.responses.js'
import {
  createTransactionBodySchema,
  transactionHttpResponseSchema,
  transactionIdParamsSchema,
  transactionQueryParamsSchema,
  transactionsHttpResponseSchema,
  updateTransactionBodySchema,
} from './transaction.http.dto.js'

export const transactionOpenApiPaths = {
  '/transactions': {
    get: {
      tags: ['Transactions'],
      summary: 'List transactions',
      security: [{ bearerAuth: [] }],
      requestParams: {
        query: transactionQueryParamsSchema,
      },
      responses: {
        '200': jsonResponse('Transaction list', transactionsHttpResponseSchema),
        '400': validationErrorResponse,
        '401': unauthorizedResponse,
        '429': tooManyRequestsResponse,
      },
    },

    post: {
      tags: ['Transactions'],
      summary: 'Create a transaction',
      security: [{ bearerAuth: [] }],
      requestBody: jsonRequestBody(createTransactionBodySchema),
      responses: {
        '201': jsonResponse('Transaction created', transactionHttpResponseSchema),
        '400': validationErrorResponse,
        '401': unauthorizedResponse,
        '404': notFoundResponse('Category not found'),
        '429': tooManyRequestsResponse,
      },
    },
  },

  '/transactions/{id}': {
    get: {
      tags: ['Transactions'],
      summary: 'Get a transaction',
      security: [{ bearerAuth: [] }],
      requestParams: {
        path: transactionIdParamsSchema,
      },
      responses: {
        '200': jsonResponse('Transaction found', transactionHttpResponseSchema),
        '400': validationErrorResponse,
        '401': unauthorizedResponse,
        '404': notFoundResponse('Transaction not found'),
        '429': tooManyRequestsResponse,
      },
    },

    patch: {
      tags: ['Transactions'],
      summary: 'Update a transaction',
      security: [{ bearerAuth: [] }],
      requestParams: {
        path: transactionIdParamsSchema,
      },
      requestBody: jsonRequestBody(updateTransactionBodySchema),
      responses: {
        '200': jsonResponse('Transaction updated', transactionHttpResponseSchema),
        '400': validationErrorResponse,
        '401': unauthorizedResponse,
        '404': notFoundResponse('Transaction not found'),
        '429': tooManyRequestsResponse,
      },
    },

    delete: {
      tags: ['Transactions'],
      summary: 'Delete a transaction',
      security: [{ bearerAuth: [] }],
      requestParams: {
        path: transactionIdParamsSchema,
      },
      responses: {
        '204': noContentResponse,
        '400': validationErrorResponse,
        '401': unauthorizedResponse,
        '404': notFoundResponse('Transaction not found'),
        '429': tooManyRequestsResponse,
      },
    },
  },
} satisfies ZodOpenApiPathsObject
