import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../shared/app-error.js'

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
    })
  }

  return res.status(500).json({ message: 'Internal Server Error' })
}
