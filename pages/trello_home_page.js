
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
  }

/**
   * Navega a la lista de tableros
   * 
   */
  async goToBoardList() {
    logger.info('Navegando a la lista de tableros...');
    await this.boardListButton.click();
    logger.success('Navegación a lista de tableros completada.');
  }

  /**
   * Abre el modal para la creacion de un tablero
   * 
   */
  async openCreateBoardModal() {
    logger.info('Abriendo modal para crear un tablero...');
    await this.page.waitForLoadState();
    await this.createBtn.waitFor({ state: 'visible', timeout: 5000 });
    await this.createBtn.click();
    logger.success('Modal de creación abierto.');
  }

/**
   * Flujo de creacion de un tablero correcto
   * 
   */
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

 /**
   * Trata de crear un tablero
   * 
   */
  async attemptToCreateBoard(titleBoard) {
    logger.info(`Intentando crear tablero con título: "${titleBoard}"`);
    await this.openCreateBoardModal();
    await this.createBoardBtn.waitFor({ state: 'visible' });
    await this.createBoardBtn.click();
    await this.titleBoardInput.fill(titleBoard);
    await this.submitCreateBoardBtn.waitFor({ state: 'visible' });
    logger.warn('Tablero no enviado aún (submit pendiente).');
  }

  /**
   * Devuelve el estado del boton de crear
   * @param {string} titleBoard - Nombre del tablero
   */
async isCreateButtonEnabled(titleBoard) {
  await this.openCreateBoardModal();
  await this.createBoardBtn.click();
  await this.titleBoardInput.fill(titleBoard);
  await this.submitCreateBoardBtn.waitFor({ state: 'visible' });
  return await this.submitCreateBoardBtn.isEnabled();
}



/**
   * Crea un tablero a traves de una plantilla
   * 
   */
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

  /**
   * Abre el menu de un tablero existente
   * 
   */
  async openMenu() {
    logger.info('Abriendo menú del tablero...');
    const board_page = new BoardPage(this.page);
    await board_page.openMenuButton.click();
    logger.success('Menú del tablero abierto.');
  }

/**
   * Elimina un tablero existente 
   * 
   */
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

 /**
   * Elimina un tablero existente usando mediante su nombre
   * @param {string} boardName - Nombre del tablero a eliminar
   */
  async deleteExistingBoard(boardName) {
    logger.info(`Eliminando tablero existente: "${boardName}"`);
    await this.goToBoardList();
    const boardLink = this.page.getByRole('link', { name: boardName, exact: true });
    await boardLink.click();
    await this.deleteBoard();
  }


 /**
 * Crea un tablero directamente mediante la API de Trello (sin UI)
 * @param {string} boardName - Nombre del tablero a crear
 * @returns {Promise<{ id: string, name: string }>} Datos del board creado
 */
async createBoardAPI(boardName) {
  const BASE_URL = 'https://api.trello.com/1';
  const apiKey = process.env.TRELLO_KEY;
  const apiToken = process.env.TRELLO_TOKEN;

  if (!apiKey || !apiToken) {
    logger.error('Faltan credenciales de API: TRELLO_KEY o TRELLO_TOKEN');
    throw new Error('Credenciales faltantes');
  }

  logger.info(`Creando tablero mediante API: "${boardName}"...`);
  const url = `${BASE_URL}/boards?key=${apiKey}&token=${apiToken}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: boardName }),
  }).catch((err) => {
    logger.error(`Error en la petición: ${err.message}`);
    throw err;
  });

  if (!response.ok) {
    const errorText = await response.text();
    const text = await response.text().catch(() => '');
    logger.error(`Falló la creación del tablero`);
    throw new Error(`Fallo al crear tablero`);
    
    //throw new Error(`Falló la creación del tablero: ${response.status}`);
  }

  const data = await response.json();
  logger.success(`Tablero creado exitosamente (API): "${data.name}" (${data.id})`);
  return data;
}
  /**
   * Elimina un tablero existente usando la API
   * @param {string} boardId - ID del tablero a eliminar
   */
  async deleteBoardAPI(boardId) {
    logger.info(`Eliminando tablero mediante API: ${boardId}...`);

    const apiKey = process.env.TRELLO_KEY;
    const apiToken = process.env.TRELLO_TOKEN;
    const BASE_URL = 'https://api.trello.com/1';
    const response = await fetch(`${BASE_URL}/boards/${boardId}?key=${apiKey}&token=${apiToken}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      logger.error(`No se pudo eliminar el tablero: ${response.status}`);
    } else {
      logger.success(`Tablero eliminado correctamente: ${boardId}`);
    }
    return response;
  }
}

module.exports = { TrelloHomePage };
