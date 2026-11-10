import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: ['./apps/api/vitest.config.ts', './apps/web/vitest.config.ts'],
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
    },
  },
})
