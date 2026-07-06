// src/shared/logger/logger.ts
import pino from 'pino'
import { env, isDevelopment, isTest } from '../../config/app.config.js'

export const verbose = env.LOG_LEVEL === 'debug' || env.LOG_LEVEL === 'trace'

export const logger = pino({
  name: 'expense-tracker',

  level: isTest ? 'silent' : env.LOG_LEVEL,

  timestamp: pino.stdTimeFunctions.isoTime,

  serializers: {
    err: pino.stdSerializers.err,
  },

  redact: {
    paths: [
      'token',
      'botToken',

      'authorization',
      'headers.authorization',
      'req.headers.authorization',

      'cookie',
      'headers.cookie',
      'req.headers.cookie',

      'password',
      'passwordHash',
      'body.password',
      'req.body.password',
    ],
    censor: '[REDACTED]',
  },

  ...(isDevelopment
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss.l',
            ignore: 'pid,hostname',
          },
        },
      }
    : {}),
})
