const { test, expect } = require('../../fixtures/login.js');
const { TrelloHomePage } = require('../../pages/trello_home_page.js');

test('Verificar que se elimine el tablero', async ({ trelloPage }) => {
    const trelloHome = new TrelloHomePage(trelloPage);
    const boardName = 'Prueba para eliminar un board' ;

    await trelloHome.createANewBoard(boardName);

    await trelloHome.deleteBoard();
});
