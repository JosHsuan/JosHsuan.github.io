import {defineConfig, devices} from '@playwright/test';
export default defineConfig({
  testDir: './tests/pages', outputDir: 'pages-test-results', timeout: 60000,
  workers: 1, retries: 0, reporter: 'list',
  use: {baseURL: 'http://127.0.0.1:4186', trace: {mode: 'retain-on-failure', screenshots: false, snapshots: true, sources: true}},
  webServer: {command: 'node scripts/serve-pages.mjs', url: 'http://127.0.0.1:4186', reuseExistingServer: false},
  projects: [
    {name: 'chromium', use: {...devices['Desktop Chrome'], viewport: {width:1440,height:1000}}},
    {name: 'webkit', use: {...devices['Desktop Safari'], viewport: {width:1440,height:1000}}},
    {name: 'mobile-chromium', use: {...devices['Pixel 7'], viewport: {width:390,height:844}}},
  ],
});
