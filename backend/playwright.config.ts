import { defineConfig, devices } from '@playwright/test';

const FRONTEND_DIR = process.env.FRONTEND_DIR || '../frontend';
const BACKEND_DIR = process.env.BACKEND_DIR || '.';
const FRONTEND_PORT = 5174;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60000,
  retries: 0,
  use: {
    baseURL: `http://localhost:${FRONTEND_PORT}`,
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npx tsx src/index.ts',
      cwd: BACKEND_DIR,
      url: 'http://localhost:3001/api/health',
      reuseExistingServer: true,
      timeout: 30000,
    },
    {
      command: `npx vite --port ${FRONTEND_PORT}`,
      cwd: FRONTEND_DIR,
      url: `http://localhost:${FRONTEND_PORT}`,
      reuseExistingServer: true,
      timeout: 30000,
    },
  ],
});
