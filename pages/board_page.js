const { ColumnListComponent } = require('./components/column_list_component.js'); 
const { clickButton, fillInput } = require('../utils/helpers_ui.js')

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
    }

    async changeBoardName(newName){
        await this.nameBoard.click();
        await this.editBoardInput.fill(newName);
        await this.editBoardInput.press('Enter');
    }

    async changeBoardVisibility({ isPublic = false, isPrivate = false, isWorkspace = false }) {
        await this.openMenuButton.click();
        await this.visibilityButton.click();

        if (isPublic) {
            const alreadyPublic = await this.toPublicButton
            .locator('[data-testid="CheckIcon"]')
            .isVisible()
            .catch(() => false);

            if (!alreadyPublic) {
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
            await this.toPrivateButton.click();
            }
        }

        if (isWorkspace) {
            const alreadyWorkspace = await this.toWorkspaceButton
            .locator('[data-testid="CheckIcon"]')
            .isVisible()
            .catch(() => false);

            if (!alreadyWorkspace) {
            await this.toWorkspaceButton.click();
            }
        }

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
