import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'

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
    console.info('Running database migrations...')

    await migrate(db, { migrationsFolder: './drizzle' })

    console.info('Database migrations completed successfully.')
  } catch (error) {
    console.error('Database migration failed.', error)
    process.exitCode = 1
  } finally {
    await pool.end()
  }
}

await runMigrations()
