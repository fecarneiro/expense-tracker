import 'zod-openapi'
import type { ZodOpenApiPathsObject } from 'zod-openapi'
import { createDocument } from 'zod-openapi'
import { authOpenApiPaths } from '../../modules/auth/http/auth.openapi.js'
import { telegramOpenApiPaths } from '../../modules/telegram/http/telegram.openapi.js'
import {
  botDescription,
  generateLinkingCodeStepDescription,
  loginStepDescription,
  registerStepDescription,
} from './openapi.bot.description.js'

const botPaths = {
  '/auth/register': {
    post: {
      ...authOpenApiPaths['/auth/register'].post,
      tags: ['Telegram Setup'],
      summary: '1. Create your account',
      description: registerStepDescription,
    },
  },

  '/auth/login': {
    post: {
      ...authOpenApiPaths['/auth/login'].post,
      tags: ['Telegram Setup'],
      summary: '2. Login and authorize',
      description: loginStepDescription,
    },
  },

  '/telegram/generate-linking-code': {
    get: {
      ...telegramOpenApiPaths['/telegram/generate-linking-code'].get,
      tags: ['Telegram Setup'],
      summary: '3. Generate a linking code',
      description: generateLinkingCodeStepDescription,
    },
  },
} satisfies ZodOpenApiPathsObject

export const botOpenApiDocument = createDocument({
  openapi: '3.1.0',
  info: {
    title: 'Telegram Bot Setup',
    version: '1.0.0',
    description: botDescription,
  },
  servers: [
    {
      url: '/',
      description: 'Current server',
    },
  ],
  tags: [
    {
      name: 'Telegram Setup',
      description: 'Follow these operations in order to link your account.',
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
  paths: botPaths,
})
