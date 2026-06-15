import type { ZodOpenApiPathsObject } from 'zod-openapi'
import {
  errorResponseSchema,
  validationErrorResponseSchema,
} from '../../../openapi/openapi.schemas.js'
import {
  categoriesHttpResponseSchema,
  categoryHttpResponseSchema,
  categoryIdParamsSchema,
  createCategoryBodySchema,
  updateCategoryBodySchema,
} from './category.http.dto.js'

export const categoryOpenApiPaths = {
  '/categories': {
    post: {
      tags: ['Categories'],
      summary: 'Create a category',
      description: 'Creates a category for the authenticated user.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: createCategoryBodySchema,
          },
        },
      },
      responses: {
        '201': {
          description: 'Category created',
          content: {
            'application/json': {
              schema: categoryHttpResponseSchema,
            },
          },
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
        '409': {
          description: 'Category already exists',
          content: {
            'application/json': {
              schema: errorResponseSchema,
            },
          },
        },
      },
    },

    get: {
      tags: ['Categories'],
      summary: 'List categories',
      description: 'Returns the categories available to the authenticated user.',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'Category list',
          content: {
            'application/json': {
              schema: categoriesHttpResponseSchema,
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

  '/categories/{id}': {
    get: {
      tags: ['Categories'],
      summary: 'Get a category',
      description: 'Returns a category by its unique identifier.',
      security: [{ bearerAuth: [] }],
      requestParams: {
        path: categoryIdParamsSchema,
      },
      responses: {
        '200': {
          description: 'Category found',
          content: {
            'application/json': {
              schema: categoryHttpResponseSchema,
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
        '404': {
          description: 'Category not found',
          content: {
            'application/json': {
              schema: errorResponseSchema,
            },
          },
        },
      },
    },

    patch: {
      tags: ['Categories'],
      summary: 'Update a category',
      description: 'Updates the name of an existing category.',
      security: [{ bearerAuth: [] }],
      requestParams: {
        path: categoryIdParamsSchema,
      },
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: updateCategoryBodySchema,
          },
        },
      },
      responses: {
        '200': {
          description: 'Category updated',
          content: {
            'application/json': {
              schema: categoryHttpResponseSchema,
            },
          },
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
        '404': {
          description: 'Category not found',
          content: {
            'application/json': {
              schema: errorResponseSchema,
            },
          },
        },
        '409': {
          description: 'Category already exists',
          content: {
            'application/json': {
              schema: errorResponseSchema,
            },
          },
        },
      },
    },

    delete: {
      tags: ['Categories'],
      summary: 'Delete a category',
      description: 'Deletes a category when it is not being used by transactions.',
      security: [{ bearerAuth: [] }],
      requestParams: {
        path: categoryIdParamsSchema,
      },
      responses: {
        '204': {
          description: 'Category deleted',
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
        '404': {
          description: 'Category not found',
          content: {
            'application/json': {
              schema: errorResponseSchema,
            },
          },
        },
        '409': {
          description: 'Category in use',
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
