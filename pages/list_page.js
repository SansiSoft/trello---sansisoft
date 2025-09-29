/** @param {import('@playwright/test').Page} page */
const { logger } = require('../utils/logger.js');

export class ListPage {
  constructor(page) {
    this.page = page;
    this.listByName = (listName) =>
      this.page.locator(`h2[data-testid="list-name"] button span:has-text("${listName}")`);
    this.getListTextarea = (listName) =>
      this.page.locator(`textarea[data-testid="list-name-textarea"][aria-label="${listName}"]`);
  }

  /**
   * Editar el nombre de una lista
   * @param {string} oldName
   * @param {string} newName
   */
  async editListName(oldName, newName) {
    logger.info(`Iniciando edición de lista: "${oldName}" → "${newName}"`);
    
    await this.listByName(oldName).click();
    
    const listTextarea = this.getListTextarea(oldName);
    await this.page.waitForTimeout(500);
    await listTextarea.waitFor({ state: 'visible', timeout: 3000 });
    
    const isEditable = await listTextarea.isEditable();
    
    logger.info('Escribiendo el nuevo nombre...');
    await listTextarea.press('Control+a');
    await listTextarea.fill(newName);
    
    try {
      await this.page.locator('body').click();
    } catch (error) {
      logger.warn('Error al hacer click fuera, continuando...');
    }
    
    await this.page.waitForTimeout(500);
    logger.success(`Edición de lista completada: "${oldName}" → "${newName}"`);
  }

  /**
   * Verificar que el nombre de la lista cambió
   * @param {string} newName
   */
  async expectListName(newName) {
    logger.info(`Verificando que la lista ahora se llama: "${newName}"`);
    await this.page.waitForTimeout(1500);
    
    try {
      await this.listByName(newName).waitFor({ state: 'visible', timeout: 10000 });
      logger.success(`Verificación exitosa - Lista renombrada a: "${newName}"`);
      return true;
    } catch (error) {
      logger.error(`Error en verificación: ${error.message}`);
      throw error;
    }
  }
}
