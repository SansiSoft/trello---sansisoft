const { expect } = require('@playwright/test');
const { BoardList } = require('../board_list.js');
const { logger } = require('../../utils/logger.js');
class BoardSwitcher {
  constructor(page) {
    this.page = page;
    this.switcher = page.getByTestId('board-switcher');
    this.searchInput = page.getByTestId('board-switcher-search-field');
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

  async getRecentBoardNames() {
    const names = await this.recentBoardsList.allTextContents();
    return names.map(name => name.trim());
  }

  async expectBoardInRecentList(boardName) {
    const names = await this.getRecentBoardNames();
    expect(names).toContain(boardName);
  }

    async selectNRecentBoard(index = 0) {
    logger.info('Iniciando proceso de cambio de tablero desde el Board Switcher...');
    await this.waitForOpen();

    const currentTitle = await this.page.title();
    const currentBoardName = currentTitle.replace(' | Trello', '').trim();
    logger.info(`Tablero actual detectado: "${currentBoardName}"`);

    const boardsCount = await this.recentBoardsList.count();
    logger.info(`Se encontraron ${boardsCount} tableros en la lista reciente.`);

    for (let i = 0; i < boardsCount; i++) {
      const candidate = this.recentBoardsList.nth(i);
      const name = (await candidate.innerText()).trim();
      logger.info(`Analizando tablero #${i + 1}: "${name}"`);

      if (name !== currentBoardName) {
        logger.info(`Tablero distinto detectado: "${name}". Iniciando cambio...`);
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
          logger.error(`Error al intentar cambiar al tablero "${name}": ${error.message}`);
          throw error;
        }
      } else {
        logger.info(`Omitiendo tablero actual "${name}" (ya está abierto).`);
      }
    }

    logger.error('No se encontraron otros tableros distintos al actual en la lista.');
    throw new Error('No hay otros tableros distintos al actual en la lista.');
  }
}


module.exports = { BoardSwitcher };