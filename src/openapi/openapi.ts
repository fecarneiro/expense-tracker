import 'zod-openapi'
import { createDocument } from 'zod-openapi'
import { categoryOpenApiPaths } from '../modules/categories/http/category.openapi.js'
import { transactionOpenApiPaths } from '../modules/transactions/http/transactions.openapi.js'
import { userOpenApiPaths } from '../modules/users/http/user.openapi.js'

export const openApiDocument = createDocument({
  openapi: '3.1.0',
  info: {
    title: 'Expense Tracker API',
    version: '1.0.0',
    description: 'Personal finance API for managing users, categories, transactions and reports.',
  },
  servers: [
    {
      url: '/',
      description: 'Current server',
    },
  ],
  tags: [
    {
      name: 'Categories',
      description: 'Manage transaction categories',
    },
    {
      name: 'Users',
      description: 'Manage the authenticated user profile',
    },
    {
      name: 'Transactions',
      description: 'Manage income and expense records',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    ...categoryOpenApiPaths,
    ...userOpenApiPaths,
    ...transactionOpenApiPaths,
  },
})
