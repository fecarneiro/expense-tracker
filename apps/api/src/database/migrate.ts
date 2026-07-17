import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'
import { logger } from '../shared/logger/logger.js'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('Environment variable DATABASE_URL is required')
}

const pool = new Pool({
  connectionString: databaseUrl,
  max: 1,
  ssl: {
    rejectUnauthorized: false,
  },
})

const db = drizzle({
  client: pool,
  casing: 'snake_case',
})

async function runMigrations() {
  try {
    logger.info('database.migration.started')
    await migrate(db, { migrationsFolder: './drizzle' })
    logger.info('database.migration.completed')
  } catch (err) {
    logger.error({ err }, 'database.migration.failed')
    process.exitCode = 1
  } finally {
    await pool.end()
  }
}

await runMigrations()
