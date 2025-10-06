const { test, expect } = require('../../../fixtures/td_board');
const {TrelloHomePage} = require('../../../pages/trello_home_page');



test('Eliminar un tablero via API',async ({trelloPage}) => {
    const trello_home_page = new TrelloHomePage(trelloPage);
    const nombreTablero = `Tablero para eliminar- ${Date.now()}`;
    const boardData = await trello_home_page.createBoardAPI(nombreTablero);
    const id_board = boardData.id;
    const responseAPI = await trello_home_page.deleteBoardAPI(id_board);
    expect(responseAPI.ok).toBeTruthy();
})


