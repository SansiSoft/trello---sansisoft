const { test, expect } = require('../../fixtures/login.js');
const { TrelloHomePage } = require('../../pages/trello_home_page.js');
const { BoardList } = require('../../pages/board_list.js');

test('Verificar que se elimine el tablero', async ({ trelloPage }) => {
    const trelloHome = new TrelloHomePage(trelloPage);
    const boardName = 'Board to be deleted ' + Date.now();
    await trelloHome.createANewBoard(boardName);
    await trelloHome.deleteBoard();
    await trelloPage.waitForLoadState();
    await expect(trelloPage).toHaveURL(/boards/);
    await trelloHome.goToBoardList();
    const deletedBoard = trelloPage.getByRole('link', { name: boardName, exact: true });
    await expect(deletedBoard).toHaveCount(0);
});

// test(`Delete a board by name`,async ({trelloPage})=>{
//     const trelloHome = new TrelloHomePage(trelloPage);
//     const boardName = 'test';
//     await trelloHome.deleteExistingBoard(boardName);
//     await trelloPage.waitForLoadState();
//     await expect(trelloPage).toHaveURL(/boards/);
//     await trelloHome.goToBoardList();
//     const deletedBoard = trelloPage.getByRole('link', { name: boardName, exact: true });
//     await expect(deletedBoard).toHaveCount(0);
// })