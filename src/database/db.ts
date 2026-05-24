import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { env } from '../config/env.config.js'
import { categoriesTable } from './schemas/category.schema.js'
import { transactionsTable } from './schemas/transactions.schema.js'
import { usersTable } from './schemas/users.schema.js'

const pool = new Pool({
  connectionString: env.DATABASE_URL,
})

const schemas = {
  users: usersTable,
  transactions: transactionsTable,
  categories: categoriesTable,
}

export const db = drizzle({
  client: pool,
  schema: schemas,
  casing: 'snake_case',
})

export type Database = typeof db
