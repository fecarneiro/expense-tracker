import type { ZodOpenApiPathsObject } from 'zod-openapi'
import {
  jsonResponse,
  tooManyRequestsResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from '../../../openapi/openapi.responses.js'
import {
  monthlyBalanceHttpResponseSchema,
  monthlyBalanceQuerySchema,
} from './analytics.http.dto.js'

export const analyticsOpenApiPaths = {
  '/analytics/balances': {
    get: {
      tags: ['Analytics'],
      summary: 'Get monthly balance',
      description:
        'Returns income, expense and balance totals grouped by month for the authenticated user.',
      security: [{ bearerAuth: [] }],
      requestParams: {
        query: monthlyBalanceQuerySchema,
      },
      responses: {
        '200': jsonResponse('Monthly balance', monthlyBalanceHttpResponseSchema),
        '400': validationErrorResponse,
        '401': unauthorizedResponse,
        '429': tooManyRequestsResponse,
      },
    },
  },
} satisfies ZodOpenApiPathsObject
