import { defineConfig, devices } from '@playwright/test';

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
process.env.GCLOUD_PROJECT = 'firebase-crackling-fire-4704';

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  timeout: 60_000,
  expect: { timeout: 5_000 },
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'e2e/results/junit.xml' }],
    ['list'],
  ],
  use: {
    baseURL: process.env['PLAYWRIGHT_TEST_BASE_URL'] ?? 'http://localhost:4210',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure-and-retries',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    env: {
      FIRESTORE_EMULATOR_HOST: 'localhost:8080',
      FIREBASE_AUTH_EMULATOR_HOST: 'localhost:9099',
      GCLOUD_PROJECT: 'firebase-crackling-fire-4704',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.11/libexec/openjdk.jdk/Contents/Home npx firebase emulators:start --only=auth,firestore',
      port: 9099,
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      command: 'npm run start',
      url: 'http://localhost:4210',
      reuseExistingServer: !process.env['CI'],
      timeout: 120_000,
    },
  ],
  outputDir: 'e2e/results',
});
