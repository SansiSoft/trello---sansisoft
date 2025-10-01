
const { test, expect } = require('../../fixtures/board.js');
const { TrelloHomePage } = require('../../pages/trello_home_page.js');
const { reportKnownBug, captureUIBug } = require('../../utils/helpers');



test('should update the page title when creating a new board', async ({ trelloPage,cleanupBoard}) => {
  const trello_home_page = new TrelloHomePage(trelloPage);
  const titleBoard = "New title board - " + Date.now();
  await trello_home_page.createANewBoard(titleBoard);
  cleanupBoard.registerBoard(titleBoard);
  await expect(trelloPage).toHaveTitle(`${titleBoard} | Trello`);

});


test('create a board from a template', async ({ trelloPage,cleanupBoard}) => {
  await expect(trelloPage).toHaveTitle(/Trello/);
  const trello_home_page = new TrelloHomePage(trelloPage);
  const titleBoard = "New title board - " + Date.now();
  await trello_home_page.createBoardFromTemplate(titleBoard);
  cleanupBoard.registerBoard(titleBoard);
  await expect(trelloPage).toHaveTitle(`${titleBoard} | Trello`);
  
});

 test('should not create a board with only spaces', async ({ trelloPage,cleanupBoard}) => {
  await expect(trelloPage).toHaveTitle(/Trello/);
  const trello_home_page = new TrelloHomePage(trelloPage);
  const titleBoard = "          ";
  await trello_home_page.attemptToCreateBoard(titleBoard);
  await expect(trello_home_page.submitCreateBoardBtn).toBeDisabled();
});

// test.fail('should not create a duplicate name board',async({trelloPage})=>{
//     const trello_home_page = new TrelloHomePage(trelloPage)
//     const duplicate_title="Duplicate title"
//     await trello_home_page.createANewBoard(duplicate_title);
//     await trello_home_page.goToBoardList();
//     await trello_home_page.attemptToCreateBoard(duplicate_title);
//     await expect(trello_home_page.submitCreateBoardBtn).toBeEnabled();
// })



// test.describe('Board name validation', () => {
//   const cases = [
//     { length: 1, shouldFail: true },
//     { length: 10, shouldFail: false },
//     { length: 100, shouldFail: false },
//     { length: 1000, shouldFail: true },
//   ];

//   for (const c of cases) {
//     test(`should ${c.shouldFail ? 'not ' : ''}create a board with name length ${c.length}`,
//       async ({ trelloPage, cleanupBoard }) => {
//         if (c.shouldFail) {
//             reportKnownBug({
//                 id: 'BUG-CB-001',
//                 title: `Board name length ${c.length} should be rejected`,
//                 description: 'La app permite crear boards con un nombre demasiado largo',
//                 impact: 'Puede romper usabilidad y afectar rendimiento',
//                 evidence: `Nombre usado:'A' repetido un total de ${c.length} veces`,
//               });
//               captureUIBug(trelloPage, `BUG-CB-001-length-${c.length}`,description=`Board name length ${c.length} should be rejected`);
//         }
//         const trello_home_page = new TrelloHomePage(trelloPage);
//         const titleBoard = 'A'.repeat(c.length);
//         await trello_home_page.createANewBoard(titleBoard);

//         if (!c.shouldFail) {
//           cleanupBoard.registerBoard(titleBoard);
//           await expect(trelloPage).toHaveTitle(`${titleBoard} | Trello`);
//         } 
          
//           await expect(trelloPage).toHaveTitle(`${titleBoard} | Trello`);
        
//       });
//   }
// });



