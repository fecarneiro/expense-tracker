import crypto from 'node:crypto'
import type { IncomingMessage } from 'node:http'
import { pinoHttp } from 'pino-http'
import { logger } from './logger.js'

type AuthenticatedIncomingMessage = IncomingMessage & {
  ip?: string
  auth?: {
    userId: string
  }
}

export const httpLogger = pinoHttp({
  logger,

  genReqId: (req, res) => {
    const headerRequestId = req.headers['x-request-id']
    const requestId = Array.isArray(headerRequestId) ? headerRequestId[0] : headerRequestId

    const id = requestId ?? crypto.randomUUID()

    res.setHeader('x-request-id', id)

    return id
  },

  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      path: req.url?.split('?')[0],
    }),

    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },

  customProps: (req) => {
    const request = req as AuthenticatedIncomingMessage

    return {
      source: 'http',
      userId: request.auth?.userId,
      clientIp: request.ip,
      userAgent: request.headers['user-agent'],
    }
  },

  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error'
    if (res.statusCode >= 400) return 'warn'
    return 'info'
  },

  customSuccessMessage: () => {
    return 'http.request.completed'
  },

  customErrorMessage: () => {
    return 'http.request.failed'
  },

  autoLogging: {
    ignore: (req) => {
      return (
        req.url === '/health' ||
        req.url === '/openapi.json' ||
        req.url?.startsWith('/docs') === true
      )
    },
  },
})
