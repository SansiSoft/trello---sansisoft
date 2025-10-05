// fixtures/card.js
const { test, expect } = require('./login.js');
const { TrelloHomePage } = require('../pages/trello_home_page.js');
const { CardPage } = require('../pages/card_page.js');

// Fixture para testing de cards
const cardList = test.extend({
    testCard: async ({ trelloPage }, use) => {
        const trello_home_page = new TrelloHomePage(trelloPage);
        const titleBoard = "Board for Tests - " + Date.now();
        const board = await trello_home_page.createANewBoard(titleBoard);
        // await expect(trelloPage).toHaveTitle(`${titleBoard} | Trello`);
        await trelloPage.waitForTimeout(7000);

        // Create new Card and open
        const cardTitle = "Test Card - " + Date.now();
        const testList = await board.createAList("TESTS");
        await testList.addCard(cardTitle);
        const card = await testList.openCard(cardTitle);
        await trelloPage.waitForTimeout(3000);

        // Crear instancia de CardPage y pasarla al test
        const cardPage = new CardPage(trelloPage, cardTitle);
        await use(cardPage);
    },
});

module.exports = {
    cardList,
    expect
};