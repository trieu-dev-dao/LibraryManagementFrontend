import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  timeout: 20000,
  reporter: 'list',
  use: {baseURL: 'http://127.0.0.1:4179', channel: 'chrome', headless: true, trace: 'retain-on-failure'},
  webServer: {command: 'node tests/start-browser-server.mjs', url: 'http://127.0.0.1:4179', reuseExistingServer: false},
});
