import { defineConfig, devices } from '@playwright/test'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const qaDir = resolve(process.env.PORTFOLIO_QA_DIR || join(process.env.RUNNER_TEMP || tmpdir(), 'portfolio-qa'))
const externalBase = process.env.PORTFOLIO_BASE_URL
const baseURL = externalBase || 'http://127.0.0.1:4173'
const channel = process.env.PLAYWRIGHT_CHANNEL || (process.platform === 'win32' ? 'chrome' : undefined)

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 2,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  outputDir: join(qaDir, 'test-results'),
  reporter: [
    ['list'],
    ['json', { outputFile: join(qaDir, 'results.json') }],
    ['html', { outputFolder: join(qaDir, 'report'), open: 'never' }],
  ],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    launchOptions: channel ? { channel } : {},
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile-touch', use: { ...devices['Pixel 7'] } },
  ],
  webServer: externalBase ? undefined : {
    command: 'node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4173 --strictPort',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 30_000,
  },
})
