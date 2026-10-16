import {defineConfig, devices} from '@playwright/test';

// Use the pinned Linux engine's native playbin3 media pipeline. Other engines
// and platforms retain their existing launch configuration.
const linuxWebKitMedia = process.platform === 'linux'
  ? {launchOptions: {env: {...process.env, WEBKIT_GST_USE_PLAYBIN3: '1'}}}
  : {};

export default defineConfig({
  testDir: './tests/pages', outputDir: 'pages-test-results', timeout: 60000,
  workers: 1, retries: 0, reporter: process.env.CI ? 'line' : 'list',
  forbidOnly: Boolean(process.env.CI),
  use: {baseURL: 'http://127.0.0.1:4186', trace: {mode: 'retain-on-failure', screenshots: false, snapshots: true, sources: true}},
  webServer: {command: 'node scripts/serve-pages.mjs', url: 'http://127.0.0.1:4186', reuseExistingServer: process.env.THESIS_REUSE_SERVER === '1'},
  projects: [
    {name: 'chromium', use: {...devices['Desktop Chrome'], viewport: {width:1440,height:1000}}},
    {name: 'webkit', use: {...devices['Desktop Safari'], ...linuxWebKitMedia, viewport: {width:1440,height:1000}}},
    {name: 'mobile-chromium', use: {...devices['Pixel 7'], viewport: {width:390,height:844}}},
  ],
});
