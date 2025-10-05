
const { test, expect } = require('../../fixtures/td_board.js');
const { TrelloHomePage } = require('../../pages/trello_home_page.js');
const { BoardPage } = require('../../pages/board_page.js');
const { BoardList } = require('../../pages/board_list.js');

const { processTestCases } = require('../../utils/helpers');
const fs = require('fs');
const path = require('path');
const dataPath = path.resolve(__dirname, '../../data/nombres-tablero.json');
const rawCases = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const boardCases = processTestCases(rawCases);



for (const testCase of boardCases) {
  test(`${testCase.id} - Crear tablero: ${testCase.title}`, async ({ trelloPage, cleanupBoard }) => {
    const trello_home_page = new TrelloHomePage(trelloPage);
    const finalName = `${testCase.newName} - ${Date.now()}`;
    await trello_home_page.createANewBoard(finalName);
    cleanupBoard.registerBoard(finalName);
    await expect(trelloPage).toHaveTitle(`${finalName} | Trello`);
  });
}

test('Verificar que se crea un tablero con caracteres especiales', async ({ trelloPage,cleanupBoard}) => {
  const trello_home_page = new TrelloHomePage(trelloPage);
  const titleBoard = "New title board !@#$%^&*() - " + Date.now();
  await trello_home_page.createANewBoard(titleBoard);
  cleanupBoard.registerBoard(titleBoard);
  await expect(trelloPage).toHaveTitle(`${titleBoard} | Trello`);

});

test('Verificar que al cerrar modal con ESC no se crea tablero', async ({ trelloPage }) => {
  const trello_home_page = new TrelloHomePage(trelloPage);
  await trello_home_page.openCreateBoardModal();
  await trelloPage.keyboard.press('Escape');
  await expect(trello_home_page.createBoardBtn).toBeHidden();
  await expect(trelloPage).toHaveTitle(/Trello/);
});


test('Verificar que se crea un tablero desde una plantilla', async ({ trelloPage,cleanupBoard}) => {
  await expect(trelloPage).toHaveTitle(/Trello/);
  const trello_home_page = new TrelloHomePage(trelloPage);
  const titleBoard = "New title board - " + Date.now();
  await trello_home_page.createBoardFromTemplate(titleBoard);
  cleanupBoard.registerBoard(titleBoard);
  await expect(trelloPage).toHaveTitle(`${titleBoard} | Trello`);
  
});

 test('Verificar que no se cree un tablero con solo espacios', async ({ trelloPage,cleanupBoard}) => {
  await expect(trelloPage).toHaveTitle(/Trello/);
  const trello_home_page = new TrelloHomePage(trelloPage);
  const titleBoard = "          ";
  await trello_home_page.attemptToCreateBoard(titleBoard);
  await expect(trello_home_page.submitCreateBoardBtn).toBeDisabled();
});

 test('BUG-CB-001 - No deberia crear un tablero con nombre duplicado',async({trelloPage})=>{
    test.fail(true, "BUG-CB-001: Se puede crear un board con un nombre duplicado");
    const trello_home_page = new TrelloHomePage(trelloPage)
    const duplicate_title="Titulo duplicado"
    await trello_home_page.createANewBoard(duplicate_title);
    await trello_home_page.goToBoardList();
    await trello_home_page.attemptToCreateBoard(duplicate_title);
    await expect(1+1==0)
})

test('Visualizar tablero creado desde la lista',async ({trelloPage,cleanupBoard})=>{
  const trello_home_page = new TrelloHomePage(trelloPage);
  const titleBoard = "New title board - " + Date.now();
  await trello_home_page.createANewBoard(titleBoard);
  await expect(trelloPage).toHaveTitle(`${titleBoard} | Trello`);
  const boardPage = new BoardPage(trelloPage);
  await boardPage.goBack();
  await trello_home_page.goToBoardList();
  const boardList = new BoardList(trello_home_page.page);
  

  await boardList.loadMoreBoards();
  await trelloPage.waitForLoadState("networkidle");
  const boardLink = trelloPage.getByRole('link', { name: titleBoard, exact: true });
  await expect(boardLink).toHaveCount(1, { timeout: 20000 });
  cleanupBoard.registerBoard(titleBoard);
});

test.describe('Board name validation (parametrizados)', () => {
  const cases = [
    { length: 10, debePasar: true },
    { length: 100, debePasar: true },
  ];

  for (const c of cases) {
    test(`Debe ${c.debePasar ? '' : 'NO '}crear un tablero con nombre de longitud ${c.length}`,
      async ({ trelloPage, cleanupBoard }) => {
        const trello_home_page = new TrelloHomePage(trelloPage);
        const titleBoard = 'A'.repeat(c.length);
        await trello_home_page.createANewBoard(titleBoard);
        await expect(trelloPage).toHaveTitle(`${titleBoard} | Trello`);
        cleanupBoard.registerBoard(titleBoard);
      });
  }
});

test.describe('Board name validation - casos inválidos', () => {
  const invalidCases = [
    { length: 1, bugCode: 'BUG-CB-1' },
    { length: 1000, bugCode: 'BUG-CB-1000' },
  ];

  for (const c of invalidCases) {
    test(`NO debe crear un tablero con nombre de longitud ${c.length}`, async ({ trelloPage }) => {
      const trello_home_page = new TrelloHomePage(trelloPage);
      const titleBoard = 'A'.repeat(c.length);
      await trello_home_page.attemptToCreateBoard(titleBoard);
      const isEnabled = await trello_home_page.submitCreateBoardBtn.isEnabled();
      //console.log(`El botón de crear está ${isEnabled ? 'habilitado' : 'deshabilitado'} para nombre de longitud ${c.length}`);
      if (isEnabled) {
        test.fail(true, `${c.bugCode}: El botón estaba habilitado para nombre inválido (${c.length})`);
      }
      await expect(trello_home_page.submitCreateBoardBtn).toBeDisabled();
    });
  }
});


