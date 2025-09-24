class TrelloHomePage {

    constructor(page) {
        this.page = page;

        this.createBtn = 'button[data-testid="header-create-menu-button"]' 
        this.createBoardBtn = 'button[data-testid="header-create-board-button"]'
        this.titleBoardInput =  'input[data-testid="create-board-title-input"]'
        this.submitCreateBoardBtn = 'button[data-testid="create-board-submit-button"]'
    }

    async createANewBoard(titleBoard) {
        await this.page.waitForLoadState();
        await this.page.waitForTimeout(5000);  

        // Espera que el botón sea visible y clickeable
        const createBtnLocator = this.page.locator(this.createBtn);
        await createBtnLocator.waitFor({ state: 'visible' });
        await createBtnLocator.click();

        const createBoardBtnLocator = this.page.locator(this.createBoardBtn);
        await createBoardBtnLocator.waitFor({ state: 'visible' });
        await createBoardBtnLocator.click();

        await this.page.fill(this.titleBoardInput, titleBoard);
        await this.page.click(this.submitCreateBoardBtn);
    }
}

module.exports = { TrelloHomePage };

