const { test, expect } = require('../../../fixtures/td_board');
const TrelloAPI = require('../../../utils/trello_api');



test('Eliminar un tablero via API',async ({}) => {
    const trelloAPI = new TrelloAPI();
    const nombreTablero = `Tablero para eliminar- ${Date.now()}`;
    const boardData = await trelloAPI.createBoardAPI(nombreTablero);
    const id_board = boardData.id;
    const responseAPI = await trelloAPI.deleteBoardAPI(id_board);
    expect(responseAPI.ok).toBeTruthy();
})


