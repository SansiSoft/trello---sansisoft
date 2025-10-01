const { expect } = require('@playwright/test');
const { ColumnListComponent } = require('./components/column_list_component.js'); 
const { clickButton, fillInput } = require('../utils/helpers_ui.js')

class BoardPage {
  constructor(page) {
    this.page = page;
    this.listTitleInput = this.page.locator('textarea[data-testid="list-name-textarea"]'); 
    this.confirmTitleTitleButton = this.page.locator('button[data-testid="list-composer-add-list-button"]');
  }

  async createAList(titleList){
    await fillInput(this.listTitleInput, titleList);
    await clickButton(this.confirmTitleTitleButton);

    // Esperar a que la lista aparezca
    const listLocator = this.page.locator(
      `li[data-testid="list-wrapper"]:has(h2[data-testid="list-name"] span:has-text("${titleList}"))`
    );
    await listLocator.waitFor({ state: 'visible' });

    // Caso constrario, lanza error locator.click: Target page, context or browser has been closed en el siguiente paso
    await this.page.waitForTimeout(1000);
    return new ColumnListComponent(this.page, titleList);
  }

}

module.exports = { BoardPage };
