const { test } = require('../../fixtures/list');
const { ListPage } = require('../../pages/list_page');

test.describe('Copiar listas de tablero', () => {

  const copyAndValidateList = async ({ trelloPage, board, list, card, newListName = '', confirm = true }) => {
    const listPage = new ListPage(trelloPage);
    const originalName = list.name;

    await trelloPage.goto(board.url);
    await trelloPage.waitForLoadState('networkidle');

    if (card) {
      await listPage.expectCardInList(card.name, originalName);
    }

    await listPage.openCopyListModal(0);
    await listPage.copyList(originalName, newListName, confirm);
    await listPage.expectedResultCopyList(originalName, newListName, confirm);

    if (card && newListName) {
      await listPage.expectCardInList(card.name, newListName);
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