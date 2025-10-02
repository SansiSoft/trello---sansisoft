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


test.describe('Changing visibility of a board',()=>{
  const states = [
    { isPublic: true, label: 'Public' },
    { isWorkspace: true, label: 'Workspace' },
  ];

  for (const state of states) {
    test(`should change board visibility to ${state.label}`, async ({ trelloPage }) => {
      const boardPage = new BoardPage(trelloPage);
      await boardPage.changeBoardVisibility(state);
      await boardPage.openMenuButton.click();
      await boardPage.visibilityButton.click();
      await expect(boardPage.visibilityButton).toHaveText(new RegExp(state.label));
    });
  }
})

test('should stay in Private', async ({ trelloPage }) => {
  const boardPage = new BoardPage(trelloPage);
  await boardPage.openMenuButton.click();
  await boardPage.visibilityButton.click();
  await expect(boardPage.visibilityButton).toHaveText(/Private/);
});