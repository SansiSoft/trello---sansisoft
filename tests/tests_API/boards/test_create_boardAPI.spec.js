const { test, expect } = require('../../../fixtures/td_board.js');
const { processTestCases } = require('../../../utils/helpers.js');
const fs = require('fs');
const  TrelloAPI  = require('../../../utils/trello_api.js');


const path = require('path');
const dataPath = path.resolve(__dirname, '../../../data/nombres-tablero.json');
const rawCases = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const boardCases = processTestCases(rawCases);

for (const testCase of boardCases) {
  test(`${testCase.id} - Crear tablero API: ${testCase.title}`, async ({cleanupBoard}) => {
    const trello_api= new TrelloAPI();
    const finalName = `${testCase.newName} - ${Date.now()}`;
    const boardData = await trello_api.createBoardAPI(finalName); 
    expect(boardData.name).toBe(finalName);
    expect(boardData.id).toBeTruthy();

    await cleanupBoard.registerBoard(finalName);
  });
}


test('No se debe crear un tablero con solo espacios (API)', async ({ trelloPage }) => {
  const trello_api = new TrelloAPI(trelloPage);
  const invalidName = "          ";
  let errorCaught = false;
  try {
    await trello_api.createBoardAPI(invalidName);
  } catch (error) {
    errorCaught = true;
    expect(error.message).toMatch(/400|invalid|Fallo/i);
  }
  expect(errorCaught).toBeTruthy();
});