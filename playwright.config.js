import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';

// Verificar si existe el storageState
const storageStatePath = './data/storageState.json';
const storageStateExists = fs.existsSync(storageStatePath);

export default defineConfig({
  testDir: './tests',
  reporter: 'html',
  use: {
    baseURL: 'https://trello.com',
    headless: false,
    screenshot: 'only-on-failure',
  },
  projects: [
    ...(storageStateExists ? [] : [{
      name: 'setup',
      testMatch: /.*\.setup\.js$/, 
    }]),
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        ...(storageStateExists ? { storageState: storageStatePath } : {}),
      },
      ...(storageStateExists ? {} : { dependencies: ['setup'] }),
    },
  ],
  timeout: 60000,
});

