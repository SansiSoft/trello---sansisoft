const { test, expect } = require('../../fixtures/login.js');
const { TrelloHomePage } = require('../../pages/trello_home_page.js');

test('should update the page title when creating a new board', async ({ trelloPage }) => {
  const trello_home_page = new TrelloHomePage(trelloPage);
  const titleBoard = "New title board - " + Date.now();

  await trello_home_page.createANewBoard(titleBoard);

  await expect(trelloPage).toHaveTitle(`${titleBoard} | Trello`);
});

