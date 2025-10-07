const { logger } = require('../utils/logger.js');
const { expect } = require('@playwright/test');

/** @param {import('@playwright/test').Page} page */
class ListPage {
  constructor(page) {
    this.page = page;
    this.addListButton = this.page.locator('[data-testid="list-composer-button"]');
    this.listNameInput = this.page.getByPlaceholder('Enter list name…');
    this.saveListButton = this.page.getByRole('button', { name: 'Add list' });
    this.cancelListButton = this.page.locator('[data-testid="list-composer-cancel-button"]');
    this.listByName = (listName) =>
      this.page.locator(`h2[data-testid="list-name"] button span:has-text("${listName}")`);
    this.getListTextarea = (listName) =>
      this.page.locator(`textarea[data-testid="list-name-textarea"][aria-label="${listName}"]`);
    this.overflowMenu = '[data-testid="OverflowMenuHorizontalIcon"]';
    this.listEditMenuButton = '[data-testid="list-edit-menu-button"]';
    this.moveListOption = 'text=Move list';
    this.copyListOption = 'text=Copy list';
    this.archiveListButton = '[data-testid="list-actions-archive-list-button"]';
    this.undoArchiveButton = 'button:has-text("Undo")';
    this.boardSelect = '#move-list-screen-board-options-select';
    this.positionSelect = '#move-list-screen-position-select';
    this.saveButton = 'button[type="submit"]';
    this.copyListModal = this.page.locator('#copy-list-header');
    this.listNameCopyInput = this.page.locator('#listName');
    this.createListButton = this.page.getByRole('button', { name: 'Create list' });
    this.closePopoverButton = this.page.locator('button[aria-label="Close popover"]');
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
  async openMoveListModal(listIndex = 0) {
    logger.info(`Abriendo modal de mover lista para la lista en posición ${listIndex}`);
    
    // Esperar a que la página esté completamente cargada
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000); // Espera adicional para estabilidad
    
    // Seleccionar el botón de menú de la lista específica (tres puntos de la lista)
    const listEditMenuButtons = this.page.locator(this.listEditMenuButton);
    
    // Asegurar que el botón existe y es clickeable
    await listEditMenuButtons.nth(listIndex).waitFor({ state: 'visible', timeout: 10000 });
    await listEditMenuButtons.nth(listIndex).click();
    
    logger.info('Haciendo clic en "Move list"');
    
    // Esperar que el menú aparezca y sea clickeable
    await this.page.locator(this.moveListOption).waitFor({ state: 'visible', timeout: 5000 });
    await this.page.locator(this.moveListOption).click();
    
    // Verificar que el modal se abrió
    await this.page.waitForSelector(this.boardSelect, { timeout: 10000 });
    
    logger.success('Modal de mover lista abierto exitosamente');
  }

  async moveList({ boardName, position }) {
    logger.info(`Moviendo lista - Tablero: ${boardName || 'mismo'}, Posición: ${position || 'por defecto'}`);
    
    if (boardName) {
      // Esperar que el selector de tablero esté listo
      await this.page.locator(this.boardSelect).waitFor({ state: 'visible', timeout: 10000 });
      await this.page.waitForTimeout(500); // Pequeña pausa para estabilidad
      
      // Limpiar y escribir el nombre del tablero
      await this.page.locator(this.boardSelect).clear();
      await this.page.locator(this.boardSelect).fill(boardName);
      await this.page.waitForTimeout(1000); // Esperar que aparezcan las opciones
      await this.page.keyboard.press('Enter');
      
      logger.info(`Tablero seleccionado: ${boardName}`);
    }
    
    if (position) {
      // Esperar que el selector de posición esté disponible
      await this.page.locator(this.positionSelect).waitFor({ state: 'visible', timeout: 10000 });
      await this.page.waitForTimeout(500);
      
      await this.page.locator(this.positionSelect).clear();
      await this.page.locator(this.positionSelect).fill(position.toString());
      await this.page.waitForTimeout(500);
      await this.page.keyboard.press('Enter');
      
      logger.info(`Posición seleccionada: ${position}`);
    }
    
    // Esperar y hacer clic en guardar
    await this.page.locator(this.saveButton).waitFor({ state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(500);
    await this.page.locator(this.saveButton).click();
    
    // Esperar que la operación se complete
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000); // Espera crítica para que Trello procese el movimiento
    
    logger.success('Lista movida exitosamente');
  }

  async cancelMoveListModal() {
    // clic fuera del modal (ejemplo: body)
    await this.page.mouse.click(0, 0);
  }

  async expectListPosition(listName, positionIndex) {
    logger.info(`Verificando que la lista "${listName}" está en la posición ${positionIndex}`);
    
    // Esperar que la página se estabilice después del movimiento
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000); // Espera crítica para que el DOM se actualice
    
    const listTitles = this.page.locator('[data-testid="list-name"] span');
    
    try {
      // Esperar que las listas estén visibles
      await listTitles.first().waitFor({ state: 'visible', timeout: 15000 });
      
      // Verificar que tenemos suficientes listas
      const listCount = await listTitles.count();
      logger.info(`Número de listas encontradas: ${listCount}`);
      
      if (positionIndex >= listCount) {
        throw new Error(`Posición ${positionIndex} no existe. Solo hay ${listCount} listas.`);
      }
      
      // Usar expect de Playwright para verificar el texto con reintentos automáticos
      await expect(listTitles.nth(positionIndex)).toHaveText(listName, { timeout: 10000 });
      logger.success(`Lista "${listName}" encontrada en posición ${positionIndex}`);
      return true;
    } catch (error) {
      // Debug adicional en caso de fallo
      const actualTexts = await listTitles.allTextContents();
      logger.error(`Error verificando posición de lista: ${error.message}`);
      logger.error(`Listas encontradas: ${JSON.stringify(actualTexts)}`);
      logger.error(`Se buscaba "${listName}" en posición ${positionIndex}`);
      throw error;
    }
  }

  /**
   * Verificar que una tarjeta específica existe en una lista específica
   * @param {string} cardName - Nombre de la tarjeta a verificar
   * @param {string} listName - Nombre de la lista donde debe estar la tarjeta
   */
  async expectCardInList(cardName, listName) {
    const logger = require('../utils/logger').logger;
    
    logger.info(`Verificando que la tarjeta "${cardName}" existe en la lista "${listName}"`);
    
    // Buscar la lista por nombre
    const listContainer = this.page.locator(`[data-testid="list"]:has([data-testid="list-name"]:has-text("${listName}"))`);
    
    // Buscar la tarjeta dentro de esa lista
    const cardInList = listContainer.locator(`[data-testid="card-name"]:has-text("${cardName}")`);
    
    try {
      await cardInList.waitFor({ state: 'visible', timeout: 10000 });
      logger.success(`Tarjeta "${cardName}" encontrada en la lista "${listName}"`);
      return true;
    } catch (error) {
      logger.error(`Tarjeta "${cardName}" no encontrada en la lista "${listName}": ${error.message}`);
      throw error;
    }
  }

  /**
   * Abrir modal de archivar lista
   * @param {number} listIndex - Índice de la lista (0-based)
   */
  async openArchiveListModal(listIndex = 0) {
    logger.info(`Abriendo modal de archivar lista para la lista en posición ${listIndex}`);
    
    // Esperar a que la página esté completamente cargada
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
    
    // Seleccionar el botón de menú de la lista específica
    const listEditMenuButtons = this.page.locator(this.listEditMenuButton);
    
    // Asegurar que el botón existe y es clickeable
    await listEditMenuButtons.nth(listIndex).waitFor({ state: 'visible', timeout: 10000 });
    await listEditMenuButtons.nth(listIndex).click();
    
    logger.info('Haciendo clic en "Archive list"');
    
    // Esperar que el menú aparezca y hacer clic en archivar
    await this.page.locator(this.archiveListButton).waitFor({ state: 'visible', timeout: 5000 });
    await this.page.locator(this.archiveListButton).click();
    
    logger.success('Lista archivada exitosamente');
  }

  /**
   * Deshacer el archivado de una lista usando el botón Undo
   */
  async undoArchiveList() {
    logger.info('Intentando deshacer el archivado de la lista');
    
    try {
      // Esperar que aparezca el botón Undo (aparece por pocos segundos)
      await this.page.locator(this.undoArchiveButton).waitFor({ state: 'visible', timeout: 8000 });
      await this.page.locator(this.undoArchiveButton).click();
      
      // Esperar que la operación se complete
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(2000);
      
      logger.success('Archivado deshecho exitosamente - Lista restaurada');
      return true;
    } catch (error) {
      logger.error(`No se pudo deshacer el archivado: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verificar que una lista ya no está visible en el tablero (fue archivada)
   * @param {string} listName - Nombre de la lista que debería estar archivada
   */
  async expectListArchived(listName) {
    logger.info(`Verificando que la lista "${listName}" fue archivada (no visible)`);
    
    await this.page.waitForTimeout(2000); // Esperar que el DOM se actualice
    
    const listTitles = this.page.locator('[data-testid="list-name"] span');
    
    try {
      // Obtener todas las listas visibles
      const visibleLists = await listTitles.allTextContents();
      
      if (visibleLists.includes(listName)) {
        logger.error(`La lista "${listName}" aún está visible. No fue archivada.`);
        logger.error(`Listas visibles: ${JSON.stringify(visibleLists)}`);
        throw new Error(`La lista "${listName}" no fue archivada correctamente`);
      }
      
      logger.success(`Lista "${listName}" archivada correctamente - No visible en el tablero`);
      return true;
    } catch (error) {
      logger.error(`Error verificando archivado: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verificar que una lista está visible en el tablero (no archivada)
   * @param {string} listName - Nombre de la lista que debería estar visible
   */
  async expectListVisible(listName) {
    logger.info(`Verificando que la lista "${listName}" está visible en el tablero`);
    
    await this.page.waitForTimeout(2000); // Esperar que el DOM se actualice
    
    const listTitles = this.page.locator('[data-testid="list-name"] span');
    
    try {
      // Esperar que al menos una lista sea visible
      await listTitles.first().waitFor({ state: 'visible', timeout: 10000 });
      
      // Verificar que la lista específica está presente
      const listWithName = this.page.locator(`[data-testid="list-name"] span:has-text("${listName}")`);
      await listWithName.waitFor({ state: 'visible', timeout: 10000 });
      
      logger.success(`Lista "${listName}" está visible en el tablero`);
      return true;
    } catch (error) {
      const visibleLists = await listTitles.allTextContents();
      logger.error(`Lista "${listName}" no está visible`);
      logger.error(`Listas visibles: ${JSON.stringify(visibleLists)}`);
      throw error;
    }
  }

  /**
   * Crear nueva lista
   * @param {string} listName
   */
  async createList(listName) {
    logger.info(`Creando lista con nombre: "${listName}"`);
    await this.addListButton.click();
    if (listName !== 'CANCEL:createList') {
      await this.listNameInput.fill(listName === 'EMPTY' ? '' : listName);
      await this.saveListButton.click();
    } else {
      await this.cancelListButton.click();
    }
    await this.page.waitForTimeout(500);
  }
  
  /**
   * Validar que la lista se creó
   * @param {string} expectedName
   */
  async expectListName(expectedName) {
    logger.info(`Verificando lista creada: "${expectedName}"`);
    await this.listByName(expectedName).waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
 * Validar que no se creó la lista
 * @param {string} listName - nombre de la lista a verificar
 */
  async expectListNotCreated(listName) {
    logger.info(`Verificando que no se haya creado la lista: "${listName}"`);

    let notCreated = true;

    if (listName === 'EMPTY' || listName === 'CANCEL:createList') {
      // Caso input vacío o acción cancelada
      const emptyList = this.page.locator('h2[data-testid="list-name"] span:has-text("")');
      const count = await emptyList.count();
      notCreated = count === 0;
    } else {
      // Otros casos: verificamos que la lista con el nombre exacto no exista
      const list = this.page.locator(`h2[data-testid="list-name"] span:has-text("${listName}")`);
      const count = await list.count();
      notCreated = count === 0;
    }

    if (!notCreated) {
      throw new Error(`La lista "${listName}" se creó cuando no debía`);
    } else {
      logger.success(`La lista "${listName}" NO se creó (correcto)`);
    }

    return notCreated;
  }

  async  openCopyListModal(listIndex = 0) {
    logger.info(`Abriendo modal de mover lista para la lista en posición ${listIndex}`);
    
    // Esperar a que la página esté completamente cargada
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000); // Espera adicional para estabilidad
    
    // Seleccionar el botón de menú de la lista específica (tres puntos de la lista)
    const listEditMenuButtons = this.page.locator(this.listEditMenuButton);
    
    // Asegurar que el botón existe y es clickeable
    await listEditMenuButtons.nth(listIndex).waitFor({ state: 'visible', timeout: 10000 });
    await listEditMenuButtons.nth(listIndex).click();
    
    logger.info('Haciendo clic en "Copy list"');
    
    // Esperar que el menú aparezca y sea clickeable
    await this.page.locator(this.copyListOption).waitFor({ state: 'visible', timeout: 5000 });
    await this.page.locator(this.copyListOption).click();
    
    // Verificar que el modal se abrió
    await this.copyListModal.waitFor({ state: 'visible', timeout: 10000 });
    
    logger.success('Modal de copiar lista abierto exitosamente');
  }

  /**
   * Copiar lista
   * @param {string} originalName - Nombre actual de la lista a copiar.
   * @param {string} newName - Nuevo nombre que se le asignará a la copia.
   * @param {boolean} confirm
   */
  async copyList(originalName, newName = '', confirm = true) {
    
    // Configurar las opciones dentro del modal
    if (newName) {
      logger.info(`Copiando lista con otro nombre: "${originalName}" → "${newName}"`);
      await this.listNameCopyInput.press('Control+a');
      await this.listNameCopyInput.fill(newName);
    }else{
      logger.info(`Copiando lista sin cambiar nombre: "${originalName}"`);
    }
    // Confirmar o cancelar la copia
      if (confirm) {
        await this.createListButton.click();
      } else {
        await this.closePopoverButton.click();
      }
  }

/**
   * @param {string} originalName
   * @param {string} newName
   * @param {boolean} confirm
   */
  async expectedResultCopyList(originalName, newName='', confirm = true){
    // Esperar el resultado
    try {
      if (confirm && newName) {
        await expect(this.listByName(newName)).toBeVisible({ timeout: 10000 });
      } else if (confirm && !newName) {
        await expect(this.listByName(originalName)).toHaveCount(2);
      } else {
        // Si se canceló, solo verificamos que no haya cambio
        await expect(this.copyListModal).toBeHidden();
      }
      logger.success(`Copia exitosa - Nombre de Lista copiada: "${newName}"`);
      return true;
    } catch (error) {
      logger.error(`Error en verificación: ${error.message}`);
      throw error;
    }
  }


}
 


module.exports = { ListPage };
