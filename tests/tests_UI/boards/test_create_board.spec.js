
const { test, expect } = require('../../../fixtures/td_board.js');
const { TrelloHomePage } = require('../../../pages/trello_home_page.js');
const { BoardPage } = require('../../../pages/board_page.js');
const { BoardList } = require('../../../pages/board_list.js');
const { processTestCases, reportKnownBug, captureUIBug } = require('../../../utils/helpers');
const fs = require('fs');
const path = require('path');
const dataPath = path.resolve(__dirname, '../../../data/nombres-tablero.json');
const rawCases = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const boardCases = processTestCases(rawCases);



for (const testCase of boardCases) {
  test(`${testCase.id} - Crear tablero: ${testCase.title}`, async ({ trelloPage, cleanupBoard }) => {
    const trello_home_page = new TrelloHomePage(trelloPage);
    const finalName = `${testCase.newName} - ${Date.now()}`;
    await trello_home_page.createANewBoard(finalName);
    await expect(trelloPage).toHaveTitle(`${finalName} | Trello`);
    cleanupBoard.registerBoard(finalName);
  });
}

test('CB-05:Verificar que al cerrar modal con ESC no se crea tablero', async ({ trelloPage }) => {
  const trello_home_page = new TrelloHomePage(trelloPage);
  await trello_home_page.openCreateBoardModal();
  await trelloPage.keyboard.press('Escape');
  await expect(trello_home_page.createBoardBtn).toBeHidden();
  await expect(trelloPage).toHaveTitle(/Trello/);
});


test('CB-06:Verificar que se crea un tablero desde una plantilla', async ({ trelloPage,cleanupBoard}) => {
  await expect(trelloPage).toHaveTitle(/Trello/);
  const trello_home_page = new TrelloHomePage(trelloPage);
  const titleBoard = "New title board - " + Date.now();
  await trello_home_page.createBoardFromTemplate(titleBoard);
  cleanupBoard.registerBoard(titleBoard);
  await expect(trelloPage).toHaveTitle(`${titleBoard} | Trello`);
  
});

 test('CB-07:Verificar que no se cree un tablero con solo espacios', async ({ trelloPage,cleanupBoard}) => {
  await expect(trelloPage).toHaveTitle(/Trello/);
  const trello_home_page = new TrelloHomePage(trelloPage);
  const titleBoard = "          ";
  await trello_home_page.attemptToCreateBoard(titleBoard);
  await expect(trello_home_page.submitCreateBoardBtn).toBeDisabled();
});

 test('CB-08:Crear un tablero con nombre duplicado',async({trelloPage,cleanupBoard})=>{
    const trello_home_page = new TrelloHomePage(trelloPage)
    const duplicate_title="Titulo duplicado"
    await trello_home_page.createANewBoard(duplicate_title);
    await trello_home_page.goToBoardList();
    await trello_home_page.attemptToCreateBoard(duplicate_title);
    await expect(trelloPage).toHaveTitle(`${duplicate_title} | Trello`);
    await cleanupBoard.registerBoard(duplicate_title);
    
})

test('CB-09:Visualizar tablero creado desde la lista',async ({trelloPage,cleanupBoard})=>{
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

test.describe('Validacion de nombre de tableros (parametrizados)', () => {
  const cases = [
    {id:"CB-10" ,length: 10, debePasar: true },
    {id:"CB-11", length: 100, debePasar: true },
  ];

  for (const c of cases) {
    test(`@positivo ${c.id}: Debe ${c.debePasar ? '' : 'NO '}crear un tablero con nombre de longitud ${c.length}`,
      async ({ trelloPage, cleanupBoard }) => {
        const trello_home_page = new TrelloHomePage(trelloPage);
        const titleBoard = 'A'.repeat(c.length);
        await trello_home_page.createANewBoard(titleBoard);
        await expect(trelloPage).toHaveTitle(`${titleBoard} | Trello`);
        cleanupBoard.registerBoard(titleBoard);
      });
  }
});

test.describe('Validacion de nombres de tableros- casos inválidos', () => {
  const invalidCases = [
    {id:"CB-12" , length: 1, bugCode: 'BUG-CB-12' },
    {id:"CB-13", length: 1000, bugCode: 'BUG-CB-13' },
  ];

  for (const c of invalidCases) {
    test(`@negativo NO debe crear un tablero con nombre de longitud ${c.length}`, async ({ trelloPage,cleanupBoard }) => {
      const trello_home_page = new TrelloHomePage(trelloPage);
      const titleBoard = 'A'.repeat(c.length);
      await trello_home_page.createANewBoard(titleBoard);
      await expect(trelloPage).toHaveTitle(`${titleBoard} | Trello`);
      const screenshotFile = await captureUIBug(
          trelloPage,
          `BUG-${c.id}-tablero-con-nombre-nombre-de-longitud-${c.length}`,
          `Es posible crear un tablero con un nombre de longitud:${c.length}`,
          {}
        );
    reportKnownBug({
            id: `BUG-${c.id}`,
            title: `Longitud de nombre de tablero ${c.length==1?'muy corto':'muy largo'} `,
            description: `Se permitio la creacion de un tablero de longitud ${c.length}`,
            impact: 'MEDIO - ALTO influye en la UX del usuario',
            evidence: screenshotFile,
            functionalityStatus: 'DEFECTUOSO - No existe validacion',
            
          });
      cleanupBoard.registerBoard(titleBoard);    
    });
  }
});


