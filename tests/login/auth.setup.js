const { test, expect } = require('@playwright/test');
require('dotenv').config();

test('store authenticated state', async ({ page }) => {
  await page.goto('https://trello.com/login');

  await page.waitForSelector('input[name="username"]', { timeout: 15000 });
  await page.fill('input[name="username"]', process.env.EMAIL);
  await page.locator('#login-submit').click();

  await page.waitForSelector('input[name="password"]', { timeout: 15000 });
  await page.fill('input[name="password"]', process.env.PASSWORD);
  await page.locator('#login-submit').click();

  await page.waitForURL('**/boards', { timeout: 200000 });
  await expect(page).toHaveURL(/boards/);

  await page.context().storageState({ path: 'storageState.json' });
});