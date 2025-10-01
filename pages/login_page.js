const { expect } = require('@playwright/test');

class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('#login-submit');
  }

  async goto() {
    await this.page.goto('https://trello.com/login');
  }

  async login(email, password) {
    await this.usernameInput.waitFor({ timeout: 15000 });
    await this.usernameInput.fill(email);
    await this.loginButton.click();

    await this.passwordInput.waitFor({ timeout: 15000 });
    await this.passwordInput.fill(password);
    await this.loginButton.click();

    await this.page.waitForURL('**/boards', { timeout: 200000 });
    await expect(this.page).toHaveURL(/boards/);
  }
}

module.exports = { LoginPage };
