import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './tests/e2e/test-results',
  use: {
    baseURL: 'http://localhost:4631',
  },
  webServer: {
    command: 'yarn dev',
    url: 'http://localhost:4631',
    reuseExistingServer: !process.env.CI,
  },
})
