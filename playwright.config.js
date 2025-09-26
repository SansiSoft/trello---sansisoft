import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: 'html',
  use: {
    baseURL: 'https://trello.com',
    headless: true,
    screenshot: 'only-on-failure',
  },
  projects: [
    /*{
      name: 'setup',
      testMatch: /.*auth\.setup\.js/, 
    },*/
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: './data/storageState.json',
      },
      //dependencies: ['setup'],
    },
  ],
  timeout: 60000,
});

