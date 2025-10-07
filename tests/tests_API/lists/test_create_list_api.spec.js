const { test, expect } = require('../../../fixtures/api');
const { processTestCases, reportKnownBug, generateListName } = require('../../../utils/helpers');
const { logger } = require('../../../utils/logger');
const path = require('path');
const fs = require('fs');
const TrelloAPI = require('../../../utils/trello_api');
const { faker } = require('@faker-js/faker');

const dataPath = path.resolve(__dirname, '../../../data/list-create-cases.json');
const rawCases = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const listCases = processTestCases(rawCases);

const API_KEY = process.env.TRELLO_KEY;
const API_TOKEN = process.env.TRELLO_TOKEN;

test.describe('API - Crear listas (POST /lists)', () => {

  for (const testCase of listCases) {
  const marksString = testCase.marksAPI?.map(mark => `@${mark}`).join(' ') || '';
  test(`${marksString}${testCase.id} - ${testCase.title}`, async ({ apiContext, apiBoard }) => {
      const boardId =  apiBoard.id;
      const listName = testCase.name || generateListName();

      logger.info(`\nEjecutando caso ${testCase.id}: ${testCase.title}`);
      logger.info(`Board ID: ${boardId}`);
      logger.info(`Nombre de lista: "${listName}"`);

      try {
        const response = await apiContext.createList(boardId, listName);

        // Casos especiales
        if (testCase.id === 2) { // Nombre vacío
            if (!response.name) {
                logger.success('Lista no tiene nombre como se esperaba');
            } else {
                logger.warn(`La API permitió crear lista con nombre: "${response.name}"`);
                reportKnownBug({
                id: 'API-LIST-EMPTY-NAME',
                title: 'Lista creada con nombre vacío',
                description: `Se creó una lista con nombre vacío: "${response.name}"`,
                evidence: JSON.stringify(response).slice(0, 500)
                });
                test.fail("bug conocido: Deberia dar error con nombre vacio");
            }
        }

        if (testCase.id === 4) { // Nombre largo
            const actualLength = response.name?.length || 0;
            if (actualLength > 512) {
                logger.warn(`La API permitió nombre > 512 caracteres (${actualLength})`);
                reportKnownBug({
                id: 'API-LIST-LONG-NAME',
                title: 'Nombre de lista excede 512 chars',
                description: `Se creó una lista con ${actualLength} caracteres`,
                evidence: JSON.stringify(response).slice(0, 500)
                });
                test.fail("bug conocido: Se creo con mas de 512 caracteres");
            }
        }

        // Caso ID inválido
        if (testCase.id === 5) {
            logger.warn(`Este test espera error, pero Trello devuelve 200`);
            reportKnownBug({
                id: 'API-LIST-ID-INVALID',
                title: 'Trello no falla con ID inválido',
                description: `Se esperaba error 4xx pero se devolvio status 200`,
                evidence: JSON.stringify(response).slice(0, 500)
            });
            test.fail("bug conocido: API permitió crear varias listas (id invalido)");
        }

        // Casos “positivos” siguen usando expect
        if (testCase.expectedStatus === 200) {
            expect(response.idBoard).toBe(boardId);
            expect(response.name).toBe(listName);
            logger.success(`Lista creada correctamente: "${response.name}"`);
        }

      } catch (error) {
        logger.error(`Error al crear lista: ${error.message}`);
        throw error;
      }
      logger.info(`Caso ${testCase.id} completado\n`);
    });
  }

  // Caso negativo adicional: token inválido
  test('@negativo NEG-01 - Crear lista sin autenticación', async ({ apiBoard }) => {
    const invalidApi = new TrelloAPI({
        key: API_KEY,
        token: 'invalid_token_12345',
        logger,
    });

    try {
        await invalidApi.request('/lists', {
        method: 'POST',
        params: { name: 'Unauthorized', idBoard: apiBoard.id },
        });

        // Si llega aquí, no devolvió error
        throw new Error('API aceptó la creación con token inválido');

    } catch (error) {
        logger.info(`Error capturado: ${error.message}`);
        logger.info(`Status: ${error.status}`);
        logger.info(`Body: ${JSON.stringify(error.body)}`);

        // Verificación final
        expect(error.status, `Error recibido: ${error.message}`).toBe(401);
        logger.success('API devolvió 401 Unauthorized como se esperaba');
    }
    });

});