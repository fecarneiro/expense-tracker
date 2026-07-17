import request from 'supertest'
import type { createApp } from '../../app.js'

export type HttpTestApp = ReturnType<typeof createApp>

export type HttpMethod = 'get' | 'post' | 'patch' | 'delete'

export function sendUnauthorized(
  app: HttpTestApp,
  method: HttpMethod,
  path: string,
  body?: unknown,
) {
  const req = request(app)[method](path)
  return body === undefined ? req : req.send(body as string | object | undefined)
}
