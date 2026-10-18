import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './tests/.output',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4322', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run build && npx astro preview --port 4322 --ignore-lock',
    url: 'http://localhost:4322',
    reuseExistingServer: false,
    timeout: 180_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
});
