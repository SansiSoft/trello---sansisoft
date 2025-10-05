const { test, expect } = require('../../../fixtures/td_board');
const {TrelloHomePage} = require('../../../pages/trello_home_page');

test('Crear un tablero por API desde el POM', async ({ trelloPage,cleanupBoard }) => {
  const trello_home_page = new TrelloHomePage(trelloPage);
  const boardName = `API Board Test - ${Date.now()}`;
  const boardData = await trello_home_page.createBoardAPI(boardName);
  expect(boardData.name).toBe(boardName);
  expect(boardData.id).toBeTruthy();
  await cleanupBoard.registerBoard(boardName);
});