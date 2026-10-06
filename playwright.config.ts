import { defineConfig, devices } from '@playwright/test';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: `http://127.0.0.1:4173${basePath}/`, trace: 'retain-on-failure' },
  webServer: { command: 'node --import tsx scripts/serve-export.ts', url: `http://127.0.0.1:4173${basePath}/`, reuseExistingServer: !process.env.CI, timeout: 30_000 },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
  ],
});
