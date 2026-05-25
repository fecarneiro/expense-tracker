import { defineConfig } from 'drizzle-kit';
import { env } from './src/config/env.config.js';

export default defineConfig({
  out: './drizzle',
 schema: './src/modules/**/*.entity.ts',
  dialect: 'postgresql',
   casing: 'snake_case',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
