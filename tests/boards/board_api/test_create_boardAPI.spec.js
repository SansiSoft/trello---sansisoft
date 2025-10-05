const { test, expect } = require('../../../fixtures/td_board');
const {TrelloHomePage} = require('../../../pages/trello_home_page');

const { processTestCases } = require('../../../utils/helpers.js');
const fs = require('fs');
const path = require('path');
const dataPath = path.resolve(__dirname, '../../../data/nombres-tablero.json');
const rawCases = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const boardCases = processTestCases(rawCases);



for (const testCase of boardCases) {
  test(`${testCase.id} - Crear tablero API: ${testCase.title}`, async ({ trelloPage, cleanupBoard }) => {
    const trello_home_page = new TrelloHomePage(trelloPage);
    const finalName = `${testCase.newName} - ${Date.now()}`;
    const boardData = await trello_home_page.createBoardAPI(finalName); 
    expect(boardData.name).toBe(finalName);
    expect(boardData.id).toBeTruthy();

    await cleanupBoard.registerBoard(finalName);
  });
}


test('No se debe crear un tablero con solo espacios (API)', async ({ trelloPage }) => {
  const trello_home_page = new TrelloHomePage(trelloPage);
  const invalidName = "          ";
  let errorCaught = false;
  try {
    await trello_home_page.createBoardAPI(invalidName);
  } catch (error) {
    errorCaught = true;
    expect(error.message).toMatch(/400|invalid|Fallo/i);
  }
  expect(errorCaught).toBeTruthy();
});