class BoardPage{
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
} module.exports = { BoardPage };