import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globalSetup: `tests/support/global-setup.ts`,
  },
})
