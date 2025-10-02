const { test, expect } = require('./login.js');
const { TrelloHomePage } = require('../pages/trello_home_page.js');
const { BoardPage } = require('../pages/board_page.js')
const { CardPage } = require('../pages/card_page.js')
const { ColumnListComponent } = require('../pages/components/column_list_component.js')

const testWithCard = test.extend({
  card: async ({ trelloPage }, use) => {
    // Create a New Board
    const trello_home_page = new TrelloHomePage(trelloPage);
    const titleBoard = "Board to test card comments - " + Date.now();
    const board = await trello_home_page.createANewBoard(titleBoard);
    await expect(trelloPage).toHaveTitle(`${titleBoard} | Trello`);
    
    // Create new Card and open
    const cardTitle = "Test Card Comments";
    const toDoList = await board.createAList("COMMENTS TESTS");
    await toDoList.addCard(cardTitle);

    // Open the Card
    const card = await toDoList.openCard(cardTitle);
    const actualCardTitle = await card.getTitle();
    await expect(actualCardTitle).toContain(cardTitle)

    await use(card);
  },
});

module.exports = { test: testWithCard , expect };

