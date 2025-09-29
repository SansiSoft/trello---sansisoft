const { test } = require('../../fixtures/list');
const { ListPage } = require('../../pages/list_page');

test('Editar lista en tablero', async ({ trelloPage, board, list }) => {
  const listPage = new ListPage(trelloPage);

  await trelloPage.goto(board.url);
  await listPage.editListName(list.name, 'Lista_2');
  await listPage.expectListName('Lista_2');
});

