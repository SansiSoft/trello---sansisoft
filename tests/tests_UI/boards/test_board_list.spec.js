const { test, expect } = require('../../../fixtures/td_board.js');
const { TrelloHomePage } = require('../../../pages/trello_home_page.js');
const { BoardPage } = require('../../../pages/board_page.js');
const { BoardList } = require('../../../pages/board_list.js');



test('@e2e BL-01:Buscar tablero en la lista y verificar que aparece', async ({ trelloPage, board,list }) => {
  const board_created_name = board.name;
  const trello_home_page = new TrelloHomePage(trelloPage);
  await trello_home_page.goToBoardList();
  const boardList = new BoardList(trello_home_page.page);
  await boardList.searchBoardByName(board_created_name);
  const boardLocator = trello_home_page.page.getByText(board_created_name, { exact: true });
  await expect(boardLocator).toBeVisible();
});

test('@e2e BL-02:Cambiar al segundo tablero desde el modal de boards', async ({ trelloPage,board }) => {
  // crear 3 tableros en este test
  const trello_home_page = new TrelloHomePage(trelloPage);
  await trello_home_page.goToBoardList();
  const board_list = new BoardList(trello_home_page.page);
  await board_list.openFirstBoard();
  const board_page = new BoardPage(board_list.page);
  const switcher = await board_page.openSwitchBoard();
  const newBoardName = await switcher.selectNRecentBoard(1);
  await expect(trelloPage).toHaveTitle(`${newBoardName} | Trello`);
});