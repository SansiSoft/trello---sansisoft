const { test, expect } = require('../../fixtures/td_board.js');
const { TrelloHomePage } = require('../../pages/trello_home_page.js');
const { logger } = require('../../utils/logger');

test('Verificar cambio de fondo de un tablero', async ({ trelloPage, board }) => {

    const trelloHome = new TrelloHomePage(trelloPage);
    await trelloPage.goto(board.url);
    await trelloPage.waitForLoadState('networkidle');
    const boardTitle = await trelloPage.title();
    console.log(' Tablero abierto:', boardTitle);

    await trelloHome.changeBoardBackground();

  });



