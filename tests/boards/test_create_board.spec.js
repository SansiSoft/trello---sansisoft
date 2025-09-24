const { test, expect } = require('../../fixtures/login.js');
const { TrelloHomePage } = require('../../pages/trello_home_page.js');

// “should … when …” pattern commonly used in BDD-style test names
test('should update the page title when creating a new board', async ({ trelloPage }) => {
  await expect(trelloPage).toHaveTitle(/Trello/);
  const trello_home_page = new TrelloHomePage(trelloPage);
  const titleBoard = "New title board - " + Date.now();
  await trello_home_page.createANewBoard(titleBoard)
  await expect(trelloPage).toHaveTitle(`${titleBoard} | Trello`);
  
});

