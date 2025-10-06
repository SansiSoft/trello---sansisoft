const { test, expect } = require('./login.js');
const { TrelloHomePage } = require('../pages/trello_home_page.js');
const { BoardPage } = require('../pages/board_page.js')
const { CardPage } = require('../pages/card_page.js')
const { ColumnListComponent } = require('../pages/components/column_list_component.js')
const { BoardAPI } = require('../trello_api/modules/board_api.js')
require('dotenv').config();

const API_KEY = process.env.TRELLO_KEY;
const API_TOKEN = process.env.TRELLO_TOKEN;
const BASE_URL_API = process.env.TRELLO_API_URL;
const ORGANIZATION_ID = process.env.ORGANIZATION_ID;
const board_api = new BoardAPI(BASE_URL_API, API_KEY, API_TOKEN)


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
    const listTitles = await board.getListTitles();
    expect(listTitles).toContain("COMMENTS TESTS")
    expect(listTitles.length).toBe(1);
    await toDoList.addCard(cardTitle);

    // Open the Card
    const card = await toDoList.openCard(cardTitle);
    const actualCardTitle = await card.getTitle();
    await expect(actualCardTitle).toContain(cardTitle)

    await use(card);
    const  boardCreated = await board_api.getBoardsByName(ORGANIZATION_ID, titleBoard);
    const boardId = boardCreated['id'];
    const  responseStatus = await board_api.deleteBoard(boardId);
    await expect(responseStatus).toBe(200)
    
  },
});

module.exports = { test: testWithCard , expect };

