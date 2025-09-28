const { test } = require('@playwright/test');
require('dotenv').config();
const { LoginPage } = require('../../pages/login_page');

test('store authenticated state', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(process.env.EMAIL, process.env.PASSWORD);
  await page.context().storageState({ path: 'data/storageState.json' });
});
