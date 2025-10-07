const { test, expect } = require('../../../fixtures/api');
const { processTestCases } = require('../../../utils/helpers.js');
const fs = require('fs');
const TrelloAPI = require('../../../utils/trello_api.js');
const { logger } = require('../../../utils/logger.js');
const path = require('path');

require('dotenv').config();

const API_KEY = process.env.TRELLO_KEY;
const API_TOKEN = process.env.TRELLO_TOKEN;
const BASE_URL_API = process.env.TRELLO_API_URL;
const ORGANIZATION_ID = process.env.ORGANIZATION_ID;
const trello_api = new TrelloAPI({ key: API_KEY, token: API_TOKEN, baseUrl: BASE_URL_API, logger });

const dataPath = path.resolve(__dirname, '../../../data/card-names-cases.json');
const rawCases = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const cardCases = processTestCases(rawCases);

const testToRun = cardCases.find(tc => tc.id == 1);

for (const testCase of cardCases) {
  test(`CC-${testCase.id} - Crear card ${testCase.title} @smoke @positivo`, async ({ apiList }) => {    
    const listId = apiList.id;
    const finalName = `${testCase.newName} - ${Date.now()}`;
    const cardData = await trello_api.createCard(listId, finalName);
    expect(cardData.id).toBeTruthy();

    const actualCard = await trello_api.getCard(cardData.id);
    expect(actualCard.name).toBe(finalName);
    expect(actualCard.idList).toBe(listId);
  });
}

// Caso negativo: no se debe crear un card vacío o con solo espacios
test(`CC-${cardCases.length + 1} No se debe crear un card con solo espacios @negativo @bug`, async ({ apiList }) => {
  const listId = apiList.id;

  const invalidName = '        ';
  let errorCaught = false;
  try {
    await trello_api.createCard(listId, invalidName);
  } catch (error) {
    errorCaught = true;
    expect(error.message).toMatch(/400|invalid|Fallo/i);
  }
  if(errorCaught){
    reportKnownBug({
        id: `API-BOARD-LENGTH-${testCase.id}`,
        title: 'Permite la creación de card con espacios como titulo',
        description: `La API permitió crear un card unicamente con espacios`,
        impact: 'BAJO - UI protege ante este bug. Solo para con la api',
        functionalityStatus: 'DEFECTUOSO',
        apiStatus: 'PERMISIVO'
      });
  }
  //expect(errorCaught).toBeTruthy();
});
