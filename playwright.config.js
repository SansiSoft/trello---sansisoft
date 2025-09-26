import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: 'tests',
    reporter: 'html',
    use: {
        baseURL: 'https://id.atlassian.com',
        headless: true,
        screenshot: 'only-on-failure', 
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    timeout: 60000, 
});

