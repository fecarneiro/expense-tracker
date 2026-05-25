import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { env } from '../config/env.config.js'
import { categoriesTable } from '../modules/categories/category.entity.js'
import { transactionsTable } from '../modules/transactions/transaction.entity.js'
import { usersTable } from '../modules/users/user.entity.js'

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
