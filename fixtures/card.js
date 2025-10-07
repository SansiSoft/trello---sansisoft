// fixtures/card.js
const { test, expect } = require('./login.js');
const { TrelloHomePage } = require('../pages/trello_home_page.js');
const { CardPage } = require('../pages/card_page.js');
const {BoardAPI} = require("../trello_api/modules/board_api");

// Fixture para testing de cards
const cardList = test.extend({
    testCard: async ({ trelloPage }, use) => {
        const trello_home_page = new TrelloHomePage(trelloPage);
        const titleBoard = "Board for Tests - " + Date.now();
        const board = await trello_home_page.createANewBoard(titleBoard);
        // await expect(trelloPage).toHaveTitle(`${titleBoard} | Trello`);
        await trelloPage.waitForTimeout(2000);

        // Crear nueva Card y abrirla
        const cardTitle = "Test Card - " + Date.now();
        const testList = await board.createAList("TESTS");
        await testList.addCard(cardTitle);
        await testList.openCard(cardTitle);
        await trelloPage.waitForTimeout(3000);

        // Crear instancia de CardPage y pasarla al test
        const cardPage = new CardPage(trelloPage, cardTitle);
        await use(cardPage);
        await trello_home_page.deleteBoard();
    },
});

module.exports = {
    cardList,
    expect
};