import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(1),
})

export const env = envSchema.parse(process.env)
export const isProduction = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'
