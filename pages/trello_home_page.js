class TrelloHomePage {

    constructor(page) {
        this.page = page;

        this.createBtn = 'button[data-testid="header-create-menu-button"]' 
        this.createBoardBtn = 'button[data-testid="header-create-board-button"]'
        this.titleBoardInput =  'input[data-testid="create-board-title-input"]'
        this.submitCreateBoardBtn = 'button[data-testid="create-board-submit-button"]'

        this.showmenuBtn = 'button[aria-label="Show menu"]'
        this.closeBoardBtnRole = { name: /close board|cerrar tablero/i };
        this.closeBtn = 'button[data-testid="popover-close-board-confirm"]'
        this.confirmDeleteBtnRole = { name: /permanently delete board|eliminar permanentemente/i };

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

   async openMenu() {
        const showMenuBtn = this.page.locator(this.showmenuBtn);
        await showMenuBtn.waitFor({ state: 'visible', timeout: 5000 });
        await showMenuBtn.click();
    }

    async deleteBoard() {
        await this.page.waitForLoadState();
        await this.openMenu();
        await this.page.waitForTimeout(1000);

        // Selecciona el boton 'Close Board'
        const closeBoardBtn = this.page.getByRole('button', this.closeBoardBtnRole);
        await closeBoardBtn.waitFor({ state: 'visible', timeout: 5000 });
        await closeBoardBtn.click();

       
        const closeBtn = this.page.locator(this.closeBtn);
        await closeBtn.waitFor({ state: 'visible', timeout: 5000 });
        await closeBtn.click();

      
        await this.page.getByText(/this board is closed|este tablero está cerrado/i).waitFor({ state: 'visible', timeout: 10000 });

        
        await this.openMenu();
        await this.page.waitForTimeout(1000);

        
        const confirmDeleteBtn = this.page.getByRole('button', this.confirmDeleteBtnRole);
        await confirmDeleteBtn.waitFor({ state: 'visible', timeout: 5000 });
        await confirmDeleteBtn.click();

    }   

}

module.exports = { TrelloHomePage };

