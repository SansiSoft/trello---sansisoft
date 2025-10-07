const { expect } = require('@playwright/test');
const { BoardList } = require('../board_list.js');
const { logger } = require('../../utils/logger.js');
class BoardSwitcher {
  constructor(page) {
    this.page = page;
    this.switcher = page.getByTestId('board-switcher');
    this.searchInput = page.getByTestId('board-switcher-search-field');
    this.workspaceBoardsList = page.locator('a[data-nav-item="board-tile"]');
    this.workspaceButton = page.locator('button[data-id^="boards-"][data-section="workspace"]');
  
    this.recentBoardsList = page.locator('[data-testid="board-switcher-recent-boards"] a[data-nav-item="board-tile"]');
  }

  async waitForOpen() {
    await expect(this.switcher).toBeVisible({ timeout: 10000 });
  }


  async getRecentListCount(){
    return await this.recentBoardsList.count();
  }

  async searchBoard(name) {
    await this.searchInput.fill(name);
    await this.page.waitForLoadState('networkidle');
  }

  async selectBoardByName(name) {
    const boardLink = this.page.getByRole('link', { name, exact: true });
    await expect(boardLink).toBeVisible({ timeout: 10000 });
    await boardLink.click();
  }

 async expandWorkspaceBoards() {
    logger.info('Abriendo la sección de tableros del workspace...');
    await expect(this.workspaceButton).toBeVisible({ timeout: 10000 });
    await this.workspaceButton.click();
    await this.page.waitForLoadState('networkidle');
    await expect(this.workspaceBoardsList.first()).toBeVisible({ timeout: 10000 });
  }

  async getWorkspaceBoardsCount() {
    return await this.workspaceBoardsList.count();
  }

  async getWorkspaceBoardNames() {
    const names = await this.workspaceBoardsList.allTextContents();
    return names.map((name) => name.trim());
  }

  async expandWorkspaceBoards() {
    logger.info('Abriendo la sección de tableros del workspace...');
    await expect(this.workspaceButton).toBeVisible({ timeout: 10000 });
    await this.workspaceButton.click();
    await this.page.waitForLoadState('networkidle');
    await expect(this.workspaceBoardsList.first()).toBeVisible({ timeout: 10000 });
  }

async selectNWorkspaceBoard(index = 0) {
    logger.info('Iniciando proceso de cambio de tablero desde la lista del workspace...');
    await this.waitForOpen();
    await this.expandWorkspaceBoards();

    const currentTitle = await this.page.title();
    const currentBoardName = currentTitle.replace(' | Trello', '').trim();
    logger.info(`Tablero actual: "${currentBoardName}"`);

    const boardsCount = await this.getWorkspaceBoardsCount();
    logger.info(`Se encontraron ${boardsCount} tableros en el workspace.`);

    if (boardsCount <= 1) {
      logger.error('No hay otros tableros en el workspace para cambiar.');
      throw new Error('No hay otros tableros distintos al actual en el workspace.');
    }

    for (let i = 0; i < boardsCount; i++) {
      const candidate = this.workspaceBoardsList.nth(i);
      const name = (await candidate.innerText()).trim();
      logger.info(`Analizando tablero #${i + 1}: "${name}"`);

      if (name !== currentBoardName) {
        logger.info(`Cambiando al tablero "${name}"...`);
        const targetUrl = await candidate.getAttribute('href');

        try {
          await Promise.all([
            this.page.waitForURL(`**${targetUrl}`, { timeout: 15000 }).catch(() => null),
            candidate.click(),
          ]);
          await expect(this.page).toHaveTitle(`${name} | Trello`, { timeout: 15000 });
          logger.success(`Cambio de tablero exitoso: ahora en "${name}"`);
          return name;
        } catch (error) {
          logger.error(`Error al cambiar al tablero "${name}": ${error.message}`);
          throw error;
        }
      }
    }

    logger.error('No se encontraron otros tableros distintos al actual en el workspace.');
    throw new Error('No hay otros tableros distintos al actual en el workspace.');
  }

}


module.exports = { BoardSwitcher };