import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { AppError } from '../shared/app-error.js'
import { verbose } from '../shared/logger/logger.js'

function logUnhandledHttpError(req: Request, err: unknown) {
  if (verbose) {
    req.log.error({ err }, 'http.request.unhandled_error')
    return
  }

  if (err instanceof Error) {
    req.log.error({ err: { type: err.name, message: err.message } }, 'http.request.unhandled_error')
    return
  }

  req.log.error({ err: { message: String(err) } }, 'http.request.unhandled_error')
}

export function errorMiddleware(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
    })
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      })),
    })
  }

  logUnhandledHttpError(req, err)

  return res.status(500).json({ message: 'Internal Server Error' })
}
