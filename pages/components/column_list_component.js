const { expect } = require('@playwright/test'); 
const { CardPage  } = require('../card_page.js'); 
const { clickButton, fillInput, forceClick } = require('../../utils/helpers_ui.js')

class ColumnListComponent {
    constructor(page, listName) {
      this.page = page;
      this.listName = listName;

      // Locator base para la columna
      this.list = page.locator(
        `li[data-testid="list-wrapper"]:has(h2[data-testid="list-name"] span:has-text("${listName}"))`
      );

      this.addCardButton = this.list.locator('button[data-testid="list-add-card-button"]');
      this.cardTitleInput = this.list.locator('textarea[data-testid="list-card-composer-textarea"]');
      this.confirmAddCardButton = this.list.locator('button[data-testid="list-card-composer-add-card-button"]');
      this.editCardButton = this.page.locator('button[data-testid="quick-card-editor-button"]');
    }

    async waitForOpen() {
      await this.cardModal.waitFor({ state: 'visible' });
    }

    async addCard(cardTitle) {
      await clickButton(this.addCardButton);
      await fillInput(this.cardTitleInput, cardTitle);
      await clickButton(this.confirmAddCardButton);
    }

    async openCard(cardTitle){
      const card = this.list.locator(
        `div[data-testid="card-done-state"] a[data-testid="card-name"]:has-text("${cardTitle}")`
      );

      await card.focus();
      await this.page.keyboard.press("Enter");
      return await this.openCard_4(cardTitle)
    }

    async openCard_4(cardTitle) {
      forceClick(this.editCardButton);
      const card = this.page.locator(
        `a[data-testid="quick-card-editor-open-card"]`
      );

      await card.waitFor({state: 'visible'})
      await forceClick(card);
      return new CardPage(this.page, cardTitle);
    }
}

module.exports = { ColumnListComponent };
