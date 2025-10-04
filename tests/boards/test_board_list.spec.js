const { test, expect } = require('../../fixtures/td_board.js');
const { TrelloHomePage } = require('../../pages/trello_home_page.js');
const { BoardPage } = require('../../pages/board_page.js');
const { BoardList } = require('../../pages/board_list.js');



test('Buscar tablero en la lista y verificar que aparece', async ({ trelloPage, board,list }) => {
  const board_created_name = board.name;
  const trello_home_page = new TrelloHomePage(trelloPage);
  await trello_home_page.goToBoardList();
  const boardList = new BoardList(trello_home_page.page);
  await boardList.searchBoardByName(board_created_name);
  const boardLocator = trello_home_page.page.getByText(board_created_name, { exact: true });
  await expect(boardLocator).toBeVisible();
});