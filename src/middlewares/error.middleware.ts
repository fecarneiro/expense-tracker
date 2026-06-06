import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { AppError } from '../shared/app-error.js'

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
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

  console.error(err)
  return res.status(500).json({ message: 'Internal Server Error' })
}
