import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { env, isProduction } from '../config/env.config.js'
import { schemas } from './schemas/schema.js'

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: isProduction
    ? {
        rejectUnauthorized: false,
      }
    : false,
})

export const db = drizzle({
  client: pool,
  schema: schemas,
  casing: 'snake_case',
  logger: !isProduction,
})

export type Database = typeof db
