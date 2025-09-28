const { test: base, expect } = require('@playwright/test');
const path = require('path');

const test = base.extend({
  trelloPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: path.join(__dirname, '../data/storageState.json'),
    });

    const page = await context.newPage();
    await page.goto('https://trello.com');
    await page.waitForLoadState('networkidle');

    await use(page);

    await context.close();
  },
});
module.exports = { test, expect };