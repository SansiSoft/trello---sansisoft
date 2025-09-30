const { logger } = require('../utils/logger.js');

/** @param {import('@playwright/test').Page} page */
class ListPage {
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

  /**
   * Verificar problemas de layout en el título de la lista
   * @param {string} listName 
   * @returns {Object}
   */
  async checkLayoutIssues(listName) {
  const listWrapper = this.page.locator('[data-testid="list-wrapper"]').first();
  const listContainer = this.page.locator('[data-testid="list"]').first();
  const listHeader = this.page.locator('[data-testid="list-header"]').first();
  const listNameSpan = this.page.locator(
    `h2[data-testid="list-name"] button span:has-text("${listName}")`
  ).first();
  const addCardButton = this.page.locator('[data-testid="list-add-card-button"]').first();

  try {
    const wrapperBox = await listWrapper.boundingBox();
    const containerBox = await listContainer.boundingBox();
    const headerBox = await listHeader.boundingBox();
    const nameBox = await listNameSpan.boundingBox();
    const addCardBox = await addCardButton.boundingBox();

    if (!wrapperBox || !containerBox || !headerBox || !nameBox || !addCardBox) {
      logger.warn('No se pudieron obtener todas las dimensiones.');
      return { hasOverflow: false };
    }
    const nameOverflowsContainerVertically =
      nameBox.y + nameBox.height > containerBox.y + containerBox.height;

    const addCardOverflowsContainerVertically =
      addCardBox.y + addCardBox.height > containerBox.y + containerBox.height;

    const hasVerticalOverflow = nameOverflowsContainerVertically || addCardOverflowsContainerVertically;
    logger.info(`   container: y=${containerBox.y}, height=${containerBox.height}`);
    logger.info(`   nameSpan: y=${nameBox.y}, height=${nameBox.height}`);
    logger.info(`   addCardButton: y=${addCardBox.y}, height=${addCardBox.height}`);
    logger.info(`   Resultado vertical: ${hasVerticalOverflow ? 'DESBORDA' : 'OK'}`);

    return {
      hasOverflow: hasVerticalOverflow,
      hasVerticalOverflow,
      details: {
        wrapperBox,
        containerBox,
        headerBox,
        nameBox,
        addCardBox
      },
      textLength: listName.length
    };
      } catch (error) {
        logger.error(`Error al verificar layout: ${error.message}`);
        return { hasOverflow: false, hasVerticalOverflow: false, error: error.message };
      }
  }
}
 

module.exports = { ListPage };
