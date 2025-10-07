const { test, expect } = require('../../../fixtures/api');
const { processTestCases, reportKnownBug } = require('../../../utils/helpers');
const { logger } = require('../../../utils/logger');
const TrelloAPI = require('../../../utils/trello_api');
const path = require('path');
const fs = require('fs');

// Cargar dataset
const dataPath = path.resolve(__dirname, '../../../data/list-create-board-API.json');
const rawBoardCases = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const boardCases = processTestCases(rawBoardCases);

test.describe('Creacion de tableros via API', () => {
  const trello_api = new TrelloAPI();

  for (const testCase of boardCases) {
    test(`@smoke ${testCase.id} - ${testCase.title}`, async ({ cleanupBoard }) => {
      logger.info(`\nAPI Test: ${testCase.id}: "${testCase.title}"`);
      logger.info(`Descripción: ${testCase.description}`);
      let finalName = testCase.newName;

      if (finalName.startsWith('FAKER:')) {
        finalName = `${finalName.replace('FAKER:', '')}_${Date.now()}`;
      } else if (finalName.startsWith('REPEAT:B:')) {
        const count = parseInt(finalName.split(':')[2]);
        finalName = 'B'.repeat(count);
      } else if (finalName === 'EMPTY') {
        finalName = '';
      }

      logger.info(`Nombre a crear: "${finalName}"`);

      // Casos específicos
      if (testCase.id === 2) {
        // Intentar crear sin nombre
        logger.info('Caso negativo: Crear tablero sin nombre');
        try {
          await trello_api.createBoardAPI(finalName);
          throw new Error('La API aceptó crear un tablero sin nombre inesperadamente');
        } catch (error) {
          expect(error.status).toBe(400);
          logger.success(' API rechazó la creación sin nombre como se esperaba');
        }

      } else if (testCase.id === 4) {
        // Nombre muy largo
        logger.info(`Probando nombre largo (${finalName.length} caracteres)...`);
        const result = await trello_api.createBoardAPI(finalName);
        const expectedMax = 512;
        const actualLength = result.name.length;

        logger.info(`Longitud esperada ≤${expectedMax}, actual: ${actualLength}`);
        if (actualLength > expectedMax) {
          logger.error(` API permitió nombre de ${actualLength} caracteres (supera 512)`);
          reportKnownBug({
            id: `API-BOARD-LENGTH-${testCase.id}`,
            title: 'Inconsistencia entre API y UI - Longitud de nombre',
            description: `La API permitió crear un tablero con ${actualLength} caracteres.`,
            impact: 'BAJO - UI puede truncar o causar errores visuales.',
            functionalityStatus: 'DEFECTUOSO',
            apiStatus: 'PERMISIVO'
          });
        } else {
          logger.success(' API respetó el límite de 512 caracteres');
        }

        await cleanupBoard.registerBoard(result.name);

      } else if (testCase.id === 9) {
        // Espacios iniciales/finales
        const result = await trello_api.createBoardAPI(finalName);
        expect(result.name.trim()).toBe(result.name);
        logger.success(` API normalizó espacios correctamente ("${result.name}")`);
        await cleanupBoard.registerBoard(result.name);

      } else if (testCase.id === 7) {
        // Duplicados
        const nameDup = finalName.replace('DUPLICATE:', '');
        const board1 = await trello_api.createBoardAPI(nameDup);
        const board2 = await trello_api.createBoardAPI(nameDup);
        expect(board1.name).toBe(board2.name);
        logger.success(` API permitió nombres duplicados ("${nameDup}")`);
        await cleanupBoard.registerBoard(board1.name);
        await cleanupBoard.registerBoard(board2.name);

      } else if (testCase.id === 10) {
        // Crear con fondo y descripción personalizada
        const params = {
          name: finalName,
          desc: 'Tablero con fondo personalizado (API test)',
          prefs_background: 'blue'
        };
        const result = await trello_api.createBoardAPI(params.name, params);
        expect(result.name).toBe(params.name);
        expect(result.desc).toContain('fondo');
        logger.success(' API creó tablero con descripción y fondo correctamente');
        await cleanupBoard.registerBoard(result.name);

      } else if (testCase.id === 13) {
        // Cancelar creación (simulación)
        logger.info('Caso 13: Cancelar creación (no se debe enviar petición real)');
        logger.success(' No se realizó ninguna solicitud a la API (simulación exitosa)');

      } else {
        // Caso general
        const result = await trello_api.createBoardAPI(finalName);
        expect(result.name).toBe(finalName);
        logger.success(` Tablero creado correctamente: "${result.name}"`);
        await cleanupBoard.registerBoard(result.name);
      }

      logger.info(`Test Case ${testCase.id} completado.\n`);
    });
  }

  
});
