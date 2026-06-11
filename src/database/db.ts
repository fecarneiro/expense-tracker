import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { env } from '../config/env.config.js'
import { schemas } from './schemas/schema.js'

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

export const db = drizzle({
  client: pool,
  schema: schemas,
  casing: 'snake_case',
})

export type Database = typeof db
