const { test, expect } = require('../../../fixtures/list');
const { ListPage } = require('../../pages/list_page');
const { logger } = require('../../utils/logger');

test.describe('Copiar listas de tablero', () => {

  const copyAndValidateList = async ({ trelloPage, board, list, card, newListName = '', confirm = true }) => {
    const listPage = new ListPage(trelloPage);
    const originalName = list.name;

    await trelloPage.goto(board.url);
    await trelloPage.waitForLoadState('networkidle');

    await listPage.openCopyListModal(0);
    await listPage.copyList(originalName, newListName, confirm);

    const targetListName = newListName || originalName;

    if (card) {
      await listPage.expectCardInList(card.name, targetListName);
    }

    await listPage.expectedResultCopyList(originalName, newListName, confirm);
    const copiedList = listPage.listByName(targetListName);
    if (confirm) {
      const expectedCount = newListName === '' ? 2 : 1;
      await expect(copiedList,`No se creó la lista copiada "${targetListName}"`).toHaveCount(expectedCount);
    } else {
      await expect(copiedList,`La lista "${targetListName}" no debería haberse creado` ).toHaveCount(1); // O 0 si esperas que no exista
    }
  };
  
  test('Copiar lista dentro del mismo tablero con nuevo nombre', async ({ trelloPage, board, list }) => {
    await copyAndValidateList({ trelloPage, board, list, newListName: list.name + '_copy', confirm: true });
  });

  test('Copiar lista dentro del mismo tablero sin cambiar nombre', async ({ trelloPage, board, list }) => {
    await copyAndValidateList({ trelloPage, board, list, newListName: '', confirm: true });
  });

  test('Copiar lista con una tarjeta', async ({ trelloPage, board, list, card }) => {
    await copyAndValidateList({ trelloPage, board, list, card, newListName: list.name + '_copy', confirm: true });
  });

  test('Cancelar la acción de copiar lista', async ({ trelloPage, board, list }) => {
    await copyAndValidateList({ trelloPage, board, list, newListName: '', confirm: false });
  });

});