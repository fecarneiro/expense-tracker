import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  test: {
    name: 'api',
    environment: 'node',
    globals: false,
    include: ['src/**/*.test.ts'],
    restoreMocks: true,
    setupFiles: ['./src/tests/setup-env.ts'],
    env: {
      NODE_ENV: 'test',
    },
    pool: 'forks',
    maxWorkers: 2,
  },
})
