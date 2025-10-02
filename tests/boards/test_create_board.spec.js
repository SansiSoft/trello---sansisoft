
const { test, expect } = require('../../fixtures/td_board.js');
const { TrelloHomePage } = require('../../pages/trello_home_page.js');
const { reportKnownBug, captureUIBug } = require('../../utils/helpers');
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

test('BUG-CB - No deberia crear un tablero con nombre duplicado',async({trelloPage})=>{
    test.fail(true, "BUG-CB-001: Se puede crear un board con un nombre duplicado");
    const trello_home_page = new TrelloHomePage(trelloPage)
    const duplicate_title="Titulo duplicado"
    await trello_home_page.createANewBoard(duplicate_title);
    await trello_home_page.goToBoardList();
    await trello_home_page.attemptToCreateBoard(duplicate_title);
    await expect(trello_home_page.submitCreateBoardBtn).toBeDisabled();
})



// test.describe('Board name validation', () => {
//   const cases = [
//     { length: 1, debePasar: false },
//     { length: 10, debePasar: true },    
//     { length: 100, debePasar: true },    
//     { length: 1000, debePasar: false }, 
//   ];

//   for (const c of cases) {
//     test.only(`Debe ${c.debePasar ? '' : 'NO '}crear un tablero con nombre de longitud ${c.length}`,
//       async ({ trelloPage, cleanupBoard }) => {
        
//         const trello_home_page = new TrelloHomePage(trelloPage);
//         const titleBoard = 'A'.repeat(c.length);

//         if (!c.debePasar) {
//           await trello_home_page.attemptToCreateBoard(titleBoard);

//           const isEnabled = await trello_home_page.submitCreateBoardBtn.isEnabled();
//           console.log(`El botón de crear está ${isEnabled ? 'habilitado' : 'deshabilitado'} para nombre de longitud ${c.length}`);

//           if (isEnabled) {
//             test.fail(true, `BUG-CB-${c.length}: El botón estaba habilitado para nombre inválido (${c.length})`);
//           }

//           await expect(trello_home_page.submitCreateBoardBtn).toBeDisabled();
//         }
//       });
//   }
// });


