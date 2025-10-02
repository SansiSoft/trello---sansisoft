const { test, expect } = require('../../fixtures/login.js');
const { TrelloHomePage } = require('../../pages/trello_home_page.js');
const { BoardPage } = require('../../pages/board_page.js');
const { BoardList } = require('../../pages/board_list.js');


test.beforeEach(async ({ trelloPage }) => {
  const trello_home_page = new TrelloHomePage(trelloPage);
  await trello_home_page.goToBoardList();
  const boardList = new BoardList(trelloPage);
  await boardList.openFirstBoard();
  const boardPage = new BoardPage(trelloPage);
  await boardPage.changeBoardVisibility({ isPrivate: true });
});


test.describe('Cambiando los estados del tablero',()=>{
  const states = [
    { isPublic: true, label: 'Public' },
    { isWorkspace: true, label: 'Workspace' },
  ];

  for (const state of states) {
    test(`Verificar que se cambie la visibilidad a :  ${state.label}`, async ({ trelloPage }) => {
      const boardPage = new BoardPage(trelloPage);
      await boardPage.changeBoardVisibility(state);
      await boardPage.openMenuButton.click();
      await boardPage.visibilityButton.click();
      await expect(boardPage.visibilityButton).toHaveText(new RegExp(state.label));
    });
  }
})

test('El board debe mantenerse en privado', async ({ trelloPage }) => {
  const boardPage = new BoardPage(trelloPage);
  await boardPage.openMenuButton.click();
  await boardPage.visibilityButton.click();
  await expect(boardPage.visibilityButton).toHaveText(/Private/);
});


test('Verificar que se edite el nombre del tablero', async ({ trelloPage }) => {
    const boardPage = new BoardPage(trelloPage);
    const newName = 'Edited Board Name ' + Date.now();
    await boardPage.changeBoardName(newName);
    await expect(boardPage.nameBoard).toHaveText(newName);
});