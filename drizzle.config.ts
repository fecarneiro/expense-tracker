import { defineConfig } from 'drizzle-kit'
import { env } from './src/config/app.config.js'

export default defineConfig({
  out: './drizzle',
  schema: './src/database/schemas/**/*.schema.ts',
  dialect: 'postgresql',
  casing: 'snake_case',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
})
