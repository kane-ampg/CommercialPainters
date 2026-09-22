import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `npm run start -- --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    /*
     * The suite asserts the "nothing was delivered" copy, so it must run on the
     * console adapter. Pinned here rather than inherited from `.env.local`,
     * because a developer pointing their own machine at the live n8n workflow
     * would otherwise email the office on every run of the e2e suite — and see
     * those assertions fail for a reason that is not a regression.
     */
    env: { ENQUIRY_TRANSPORT: 'console' },
  },
});
