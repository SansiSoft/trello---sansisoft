const { ColumnListComponent } = require('./components/column_list_component.js'); 
const { clickButton, fillInput } = require('../utils/helpers_ui.js');
const { logger } = require('../utils/logger.js');
const { BoardSwitcher } = require('./components/board_switcher.js');

class BoardPage {
    constructor(page) {
        this.page = page;
        this.nameBoard=this.page.locator("h1[data-testid='board-name-display']");
        this.editBoardInput=this.page.locator("input[data-testid='board-name-input']");
        this.openMenuButton=this.page.locator("button[aria-label='Show menu']");
        this.closeMenuButton = this.page.getByTestId('board-menu-popover').getByRole('button', { name: 'Close popover' });
        this.visibilityButton = this.page.getByText('Visibility:');
        this.toPrivateButton = this.page.locator('button[data-testid="board-visibility-dropdown-Private"]');
        this.toWorkspaceButton = this.page.locator('button[data-testid="board-visibility-dropdown-Workspace"]');
        this.toPublicButton = this.page.locator('button[data-testid="board-visibility-dropdown-Public"]');
        this.isPublicButtonConfirm = this.page.getByText('Yes, make board public');
        this.listTitleInput = this.page.locator('textarea[data-testid="list-name-textarea"]'); 
        this.confirmTitleTitleButton = this.page.locator('button[data-testid="list-composer-add-list-button"]');
        this.switchBoardButton = this.page.locator('button[data-testid="panel-nav-board-switcher-button"]');
    }

    async changeBoardName(newName){
        await this.nameBoard.click();
        await this.editBoardInput.fill(newName);
        await this.editBoardInput.press('Enter');
    }

   async openSwitchBoard() {
        await this.page.keyboard.press('b');
        const board_switcher = new BoardSwitcher(this.page);
        await board_switcher.waitForOpen();
        return board_switcher;
    }

    async goBack(){
        logger.info('Regresando a la página principal...');
        await this.page.goBack();
        logger.success('Regreso a la página principal completado.');
    }

    async changeBoardVisibility({ isPublic = false, isPrivate = false, isWorkspace = false }) {
        await this.openMenuButton.click();
        await this.visibilityButton.click();
        logger.info(`Cambiando la visibilidad del tablero a: ${isPublic ? 'Público' : isPrivate ? 'Privado' : isWorkspace ? 'Workspace' : 'Ninguno'}`);
        if (isPublic) {
            const alreadyPublic = await this.toPublicButton
            .locator('[data-testid="CheckIcon"]')
            .isVisible()
            .catch(() => false);
         
            if (!alreadyPublic) {
            logger.info('Cambiando a visibilidad Pública...');
            await this.toPublicButton.click();
            await this.isPublicButtonConfirm.click();
            }
        }

        if (isPrivate) {
            const alreadyPrivate = await this.toPrivateButton
            .locator('[data-testid="CheckIcon"]')
            .isVisible()
            .catch(() => false);

            if (!alreadyPrivate) {
            logger.info('Cambiando a visibilidad Privada...');
            await this.toPrivateButton.click();
            }
        }

        if (isWorkspace) {
            const alreadyWorkspace = await this.toWorkspaceButton
            .locator('[data-testid="CheckIcon"]')
            .isVisible()
            .catch(() => false);

            if (!alreadyWorkspace) {
            logger.info('Cambiando a visibilidad Workspace...');
            await this.toWorkspaceButton.click();
            }
        }
        logger.success('Cambio de visibilidad completado.');
        await this.closeMenuButton.click();
    }

    async createAList(titleList) {
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
