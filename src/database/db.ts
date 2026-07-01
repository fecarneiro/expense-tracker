import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { env, isProduction } from '../config/app.config.js'
import { schemas } from './schemas/schema.js'

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: isProduction
    ? {
        rejectUnauthorized: false,
      }
    : false,
  max: 5,
  min: 1,
  idleTimeoutMillis: 60_000,
  connectionTimeoutMillis: 5_000,
})

export const db = drizzle({
  client: pool,
  schema: schemas,
  casing: 'snake_case',
})

export type Database = typeof db
export type DatabaseTransaction = Parameters<Parameters<Database['transaction']>[0]>[0]
export type DatabaseClient = Database | DatabaseTransaction
