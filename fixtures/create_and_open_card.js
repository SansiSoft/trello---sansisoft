const { test, expect } = require('./login.js');
const { TrelloHomePage } = require('../pages/trello_home_page.js');
const { BoardPage } = require('../pages/board_page.js')
const { CardPage } = require('../pages/card_page.js')
const { ColumnListComponent } = require('../pages/components/column_list_component.js')
const TrelloAPI = require('../utils/trello_api');
const { logger } = require('../utils/logger');

require('dotenv').config();

const API_KEY = process.env.TRELLO_KEY;
const API_TOKEN = process.env.TRELLO_TOKEN;
const BASE_URL_API = process.env.TRELLO_API_URL;
const ORGANIZATION_ID = process.env.ORGANIZATION_ID;
const trello_api = new TrelloAPI({ key: API_KEY, token: API_TOKEN, baseUrl: BASE_URL_API, logger });


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
    logger.info(`Total Lists: | ${listTitles.length}`)
    await toDoList.addCard(cardTitle);

    // Open the Card
    const card = await toDoList.openCard(cardTitle);
    const actualCardTitle = await card.getTitle();
    await expect(actualCardTitle).toContain(cardTitle)

    await use(card);
    const  boardCreated = await trello_api.getBoardsByName(ORGANIZATION_ID, titleBoard);
    logger.info(`Board Response: ${boardCreated}`)
    const boardId = boardCreated['id'];
    logger.info(`Board Id: ${boardCreated}`)
    const  response = await trello_api.deleteBoardAPI(boardId);
    await expect(response.status).toBe(200)
    
  },
});

module.exports = { test: testWithCard , expect };

