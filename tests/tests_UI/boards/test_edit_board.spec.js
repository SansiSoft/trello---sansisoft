const { test, expect } = require('../../../fixtures/td_board.js');
const { TrelloHomePage } = require('../../../pages/trello_home_page.js');
const { BoardPage } = require('../../../pages/board_page.js');
const { BoardList } = require('../../../pages/board_list.js');
const { BoardSwitcher } = require('../../../pages/components/board_switcher.js');


test.beforeEach(async ({ trelloPage }) => {
  const trello_home_page = new TrelloHomePage(trelloPage);
  await trello_home_page.goToBoardList();
  const boardList = new BoardList(trelloPage);
  await boardList.openFirstBoard();
  const boardPage = new BoardPage(trelloPage);
  await boardPage.changeBoardVisibility({ isPrivate: true });
});


test.describe('Cambiando de visibilidad',()=>{
  const states = [
    {id:'CB014' ,isPublic: true, label: 'Public' },
    {id:'CB015', isWorkspace: true, label: 'Workspace' },
  ];

  for (const state of states) {
    test(`@smoke @e2e${state.id}: Verificar que se cambie la visibilidad a :  ${state.label}`, async ({ trelloPage }) => {
      const boardPage = new BoardPage(trelloPage);
      await boardPage.changeBoardVisibility(state);
      await boardPage.openMenuButton.click();
      await boardPage.visibilityButton.click();
      await expect(boardPage.visibilityButton).toHaveText(new RegExp(state.label));
    });
  }


test('@smoke @e2e CB016: El board debe mantenerse en privado', async ({ trelloPage }) => {
  const boardPage = new BoardPage(trelloPage);
  await boardPage.openMenuButton.click();
  await boardPage.visibilityButton.click();
});


test('@smoke @e2e CB017: Verificar que se edite el nombre del tablero en la lista de tableros', async ({ trelloPage,cleanupBoard }) => {
    const boardPage = new BoardPage(trelloPage);
    const newName = 'Edited Board Name ' + Date.now();
    await boardPage.changeBoardName(newName);
    await expect(boardPage.nameBoard).toHaveText(newName);
    await  boardPage.goBack();
    const trello_home_page = new TrelloHomePage(trelloPage);
    await trello_home_page.goToBoardList();
    const boardLink = trelloPage.getByRole('link', { name: newName, exact: true });
    await expect(boardLink).toHaveCount(1);
    cleanupBoard.registerBoard(newName);
});

})


