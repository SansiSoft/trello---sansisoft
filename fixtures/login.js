const { test: base, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/login_page');
require('dotenv').config();

const test = base.extend({
  trelloPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(process.env.EMAIL, process.env.PASSWORD);

    // Capturar la nueva pestaña de Trello
    const [trelloPage] = await Promise.all([
      page.waitForEvent('popup'),
      loginPage.goToTrelloApp()
    ]);

    await trelloPage.waitForLoadState();
    await expect(trelloPage).toHaveTitle(/Trello/);

    // Pasar la página de Trello al test
    await use(trelloPage);
  }
});

module.exports = { test, expect };

