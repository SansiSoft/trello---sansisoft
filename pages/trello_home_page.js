
const { BoardPage } = require('./board_page.js');
const { logger } = require('../utils/logger.js');

/** @param {import('@playwright/test').Page} page */
class TrelloHomePage {
  constructor(page) {
    this.page = page;

    // Header create menu
    this.createBtn = this.page.locator('button[data-testid="header-create-menu-button"]');
    this.createBoardBtn = this.page.locator('button[data-testid="header-create-board-button"]');
    this.createBoardFromTemplateBtn = this.page.locator('button[data-testid="header-create-board-from-template-button"]');

    // Create board modal
    this.titleBoardInput = this.page.locator('input[data-testid="create-board-title-input"]');
    this.submitCreateBoardBtn = this.page.locator('button[data-testid="create-board-submit-button"]');
    this.errorMessage = this.page.locator('#board-title-required-error');

    // Templates
    this.templateList = this.page.locator('button[role="menuitem"]');

    // Board list
    this.boardListButton = this.page.getByRole('link', { name: 'Boards', exact: true });

    // Board menu & delete
    this.closeBoardBtn = this.page.getByRole('button', { name: /close board|cerrar tablero/i });
    this.closeBtn = this.page.locator('button[data-testid="popover-close-board-confirm"]');
    this.isClosed = this.page.getByText(/this board is closed|este tablero está cerrado/i);
    this.deleteBoardBtn = this.page.getByRole('button', { name: /permanently delete board|eliminar permanentemente/i });
    this.confirmDeleteBtn = this.page.locator('button[data-testid="close-board-delete-board-confirm-button"]');

    // Board background change
  this.changeBackgroundBtn = this.page.getByRole('button', { name: /Change background|Cambiar fondo/i });
  this.colorsTab = this.page.getByRole('button', { name: /Colors|Colores/i });
  this.alienColorBtn = this.page.locator('button[style*="rgb(0, 121, 191)"]'); // Color azul

  }

  async goToBoardList() {
    logger.info('Navegando a la lista de tableros...');
    await this.boardListButton.click();
    logger.success('Navegación a lista de tableros completada.');
  }

  async openCreateBoardModal() {
    logger.info('Abriendo modal para crear un tablero...');
    await this.page.waitForLoadState();
    await this.createBtn.waitFor({ state: 'visible', timeout: 5000 });
    await this.createBtn.click();
    logger.success('Modal de creación abierto.');
  }

  async createANewBoard(titleBoard) {
    logger.info(`Creando un nuevo tablero: "${titleBoard}"`);
    await this.openCreateBoardModal();
    await this.createBoardBtn.waitFor({ state: 'visible' });
    await this.createBoardBtn.click();
    await this.titleBoardInput.fill(titleBoard);
    await this.submitCreateBoardBtn.click();
    logger.success(`Tablero creado exitosamente: "${titleBoard}"`);
    return new BoardPage(this.page);
  }

  async attemptToCreateBoard(titleBoard) {
    logger.info(`Intentando crear tablero con título: "${titleBoard}"`);
    await this.openCreateBoardModal();
    await this.createBoardBtn.waitFor({ state: 'visible' });
    await this.createBoardBtn.click();
    await this.titleBoardInput.fill(titleBoard);
    await this.submitCreateBoardBtn.waitFor({ state: 'visible' });
    logger.warn('Tablero no enviado aún (submit pendiente).');
  }
async isCreateButtonEnabled(titleBoard) {
  await this.openCreateBoardModal();
  await this.createBoardBtn.click();
  await this.titleBoardInput.fill(titleBoard);
  await this.submitCreateBoardBtn.waitFor({ state: 'visible' });
  return await this.submitCreateBoardBtn.isEnabled();
}


  async createBoardFromTemplate(titleBoard, templateName = '1-on-1 Meeting Agenda') {
    logger.info(`Creando tablero desde plantilla: "${templateName}" → "${titleBoard}"`);
    await this.openCreateBoardModal();
    await this.createBoardFromTemplateBtn.waitFor({ state: 'visible' });
    await this.createBoardFromTemplateBtn.click();
    await this.page.getByRole('menuitem', { name: templateName }).click();
    await this.titleBoardInput.fill(titleBoard);
    await this.submitCreateBoardBtn.click();
    logger.success(`Tablero creado desde plantilla: "${titleBoard}"`);
  }

  async openMenu() {
    logger.info('Abriendo menú del tablero...');
    const board_page = new BoardPage(this.page);
    await board_page.openMenuButton.click();
    logger.success('Menú del tablero abierto.');
  }

  async deleteBoard() {
    logger.info('Eliminando tablero actual...');
    await this.page.waitForLoadState();
    await this.openMenu();
    await this.closeBoardBtn.waitFor({ state: 'visible', timeout: 5000 });
    await this.closeBoardBtn.click();
    await this.closeBtn.waitFor({ state: 'visible', timeout: 5000 });
    await this.closeBtn.click();
    await this.isClosed.waitFor({ state: 'visible', timeout: 10000 });
    logger.info('Tablero cerrado. Procediendo a eliminación definitiva...');
    await this.openMenu();
    await this.deleteBoardBtn.click();
    await this.confirmDeleteBtn.click();
    logger.success('Tablero eliminado permanentemente.');
  }

  async deleteExistingBoard(boardName) {
    logger.info(`Eliminando tablero existente: "${boardName}"`);
    await this.goToBoardList();
    const boardLink = this.page.getByRole('link', { name: boardName, exact: true });
    await boardLink.click();
    await this.deleteBoard();
  }

  async changeBoardBackground() {
    logger.info('Cambiando el fondo del tablero');
    await this.page.waitForLoadState();

    await this.openMenu();
    await this.changeBackgroundBtn.waitFor({ state: 'visible', timeout: 5000 });
    await this.changeBackgroundBtn.click();

    await this.colorsTab.waitFor({ state: 'visible', timeout: 5000 });
    await this.colorsTab.click();

    await this.alienColorBtn.waitFor({ state: 'visible', timeout: 5000 });
    await this.alienColorBtn.click();

    logger.success(' Fondo del tablero cambiado correctamente');
  }
  
}

module.exports = { TrelloHomePage };
