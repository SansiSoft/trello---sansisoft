const { test, expect } = require('../../../fixtures/api');
const { processTestCases, reportKnownBug } = require('../../../utils/helpers');
const { logger } = require('../../../utils/logger');
const path = require('path');
const fs = require('fs');

const dataPath = path.resolve(__dirname, '../../../data/list-edit-cases.json');
const rawListCases = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const listCases = processTestCases(rawListCases);
const TrelloAPI = require('../../../utils/trello_api');

test.describe('API - Editar nombres de listas', () => {

  for (const testCase of listCases) {
    test(`@smoke ${testCase.id} - ${testCase.title}`, async ({ apiContext, apiBoard, apiList }) => {
      const originalName = apiList.name;
      
      logger.info(`\n API Test Case ${testCase.id}: "${testCase.title}"`);
      logger.info(`Nombre original: "${originalName}"`);
      logger.info(`Nuevo nombre: "${testCase.newName}"`);
      
      if (testCase.id === 2) {
        // Caso 2: Texto vacío 
        try {
          const result = await apiContext.updateList(apiList.id, { name: testCase.newName });
          if (result.name === originalName) {
            logger.success(`API mantiene nombre original cuando se envía texto vacío`);
          } else if (result.name === testCase.newName && testCase.newName === '') {
            logger.warn(`API aceptó texto vacío - puede ser comportamiento inesperado`);
          }
          const currentList = await apiContext.getList(apiList.id);
          logger.info(`Estado actual: "${currentList.name}"`);
          
        } catch (error) {
          logger.info(`API rechazó texto vacío (como se esperaba): ${error.message}`);
        }
        
      } else if (testCase.id === 4) {
        // Caso 4: Nombre largo 
        logger.info(`Probando nombre largo (${testCase.newName.length} caracteres)...`);
        
        const result = await apiContext.updateList(apiList.id, { name: testCase.newName });
        const expectedName = testCase.newName.substring(0, 512);
        const actualLength = result.name.length;
        
        logger.info(`Longitud esperada: ≤512, Longitud actual: ${actualLength}`);
        
        if (result.name === expectedName) {
          logger.success(`API truncó correctamente a 512 caracteres`);
        } else if (actualLength <= 512) {
          logger.success(`API respetó límite de 512 caracteres (${actualLength} chars)`);
        } else {
          logger.error(`API permitió nombre mayor a 512 caracteres (${actualLength} chars)`);
          reportKnownBug({
            id: `API-LIST-NAME-LENGTH-${testCase.id}`,
            title: 'Inconsistencia enre API y UI',
            description: `La API de Trello aceptó un nombre de lista de ${actualLength} caracteres, superando el límite esperado de 512.`,
            impact: 'BAJO - Inconsistencia entre API y UI, puede causar problemas de visualización',
            evidence: `Nombre enviado: ${testCase.newName.length} chars, Nombre aceptado: ${actualLength} chars`,
            functionalityStatus: 'DEFECTUOSO - No respeta límite de caracteres',
            apiStatus: 'PERMISIVO - Acepta datos que UI rechazaría'
          });
        }
        // Verificar estado actual
        const currentList = await apiContext.getList(apiList.id);
        logger.info(`Nombre final: "${currentList.name}" (${currentList.name.length} chars)`);
        
      } else {
        // Casos 1 y 3
        const result = await apiContext.updateList(apiList.id, { name: testCase.newName });
        if (result.name === testCase.newName) {
          logger.success(`API actualizó correctamente: "${result.name}"`);
        } else {
          logger.error(`API no actualizó como se esperaba`);
          logger.error(`   Esperado: "${testCase.newName}"`);
          logger.error(`   Recibido: "${result.name}"`);
          throw new Error(`Actualización fallida en caso ${testCase.id}`);
        }
      }
      logger.info(`API Test Case ${testCase.id} completado\n`);
    });
  }
  test('@negativo - Editar lista con ID inexistente', async ({ apiContext }) => {
    const fakeId = '650000000000000000000000';
    logger.info(`Intentando actualizar lista con ID inexistente: ${fakeId}`);

    try {
      await apiContext.updateList(fakeId, { name: 'Invalid Update' });
      throw new Error('La API aceptó la actualización para un ID inexistente');
    } catch (error) {
      expect(error.status).toBe(404);
      logger.success('API devolvió 404 Not Found como se esperaba');
    }
  });

  test('@negativo - Editar lista con ID inválido', async ({ apiContext }) => {
    const invalidId = 'abc123';
    logger.info(`Intentando actualizar lista con ID inválido: ${invalidId}`);

    try {
      await apiContext.updateList(invalidId, { name: 'Invalid Format' });
      throw new Error('La API aceptó un ID inválido inesperadamente');
    } catch (error) {
      expect(typeof error.status).toBe('number');
      logger.success(`API devolvió error esperado para ID inválido: ${error.message}`);
    }
  });

  test('@negativo - Editar lista sin ID en la ruta', async ({ apiContext }) => {
    logger.info('Intentando actualizar lista sin ID en la ruta');

    try {
      await apiContext.request('/lists/', { method: 'PUT', params: { name: 'No ID Case' } });
      throw new Error('La API aceptó PUT a /lists/ sin ID');
    } catch (error) {
      expect([404, 405]).toContain(error.status);
      logger.success(`API devolvió ${error.status} como se esperaba`);
    }
  });

  test('@negativo - Editar lista con payload vacío', async ({ apiContext, apiList }) => {
        logger.info('Intentando actualizar lista con payload vacío (sin body)');

        const originalName = apiList.name;
        try {
          const result = await apiContext.request('/lists/' + apiList.id, { method: 'PUT' });
          const current = await apiContext.getList(apiList.id);
          expect(current.name).toBe(originalName);
          logger.success('API aceptó PUT sin payload pero no modificó el recurso (comportamiento aceptable)');
        } catch (error) {
          if (typeof error.status === 'number') {
            expect(Math.floor(error.status / 100)).toBe(4);
            logger.success(`API devolvió ${error.status} (4xx) como se esperaba para payload vacío`);
          } else {
            throw error;
          }
        }
  });

  test('@negativo - Editar lista con payload mal formado (JSON inválido)', async ({ apiContext, apiList }) => {
      logger.info('Intentando actualizar lista con JSON mal formado');

      try {
        await apiContext.request('/lists/' + apiList.id, { method: 'PUT', rawBody: '{"name": "Broken}', headers: { 'Content-Type': 'application/json' } });
        throw new Error('La API aceptó JSON inválido inesperadamente');
      } catch (error) {
        expect(Math.floor(error.status / 100)).toBe(4);
        logger.success(`API devolvió ${error.status} como se esperaba para JSON inválido`);
      }
  });

  test('@negativo - Editar lista con campo no permitido en el payload', async ({ apiContext, apiList }) => {
      logger.info('Intentando actualizar lista con campo no permitido en payload');

      try {
        const result = await apiContext.updateList(apiList.id, { name: 'Name with extra', owner: 'hackUser' });
        expect(result.name).toBe('Name with extra');
        expect(result.owner).toBeUndefined();
        logger.success('API ignoró campos no permitidos y actualizó el nombre correctamente');
      } catch (error) {
        expect(Math.floor(error.status / 100)).toBe(4);
        logger.success(`API devolvió ${error.status} (4xx) por campo no permitido`);
      }
  });

  test('@negativo - Editar lista sin autenticación (token inválido)', async ({ apiList }) => {
      logger.info('Intentando actualizar lista usando token inválido');

      const validKey = process.env.TRELLO_KEY;
      const invalidToken = 'invalid_token_for_test_12345';

      const attackerApi = new TrelloAPI({ key: validKey, token: invalidToken, logger });

      try {
        await attackerApi.request('/lists/' + apiList.id, { method: 'PUT', params: { name: 'Attack Name' } });
        throw new Error('La API aceptó la actualización con token inválido inesperadamente');
      } catch (error) {
        expect(error.status).toBe(401);
        logger.success('API devolvió 401 Unauthorized para token inválido como se esperaba');
      }
    });

  test('@negativo - Editar lista con permisos insuficientes', async ({ apiList }) => {
      logger.info('Intentando actualizar lista usando credenciales de otro usuario (permisos insuficientes)');

      const altKey = process.env.TRELLO_KEY_ALT;
      const altToken = process.env.TRELLO_TOKEN_ALT;

      test.skip(!altKey || !altToken, 'Credenciales alternativas faltantes: establece TRELLO_KEY_ALT y TRELLO_TOKEN_ALT para ejecutar este test');

      const altApi = new TrelloAPI({ key: altKey, token: altToken, logger });

      try {
        await altApi.request('/lists/' + apiList.id, { method: 'PUT', params: { name: 'No Perms Name' } });
        throw new Error('La API aceptó la actualización con credenciales de otro usuario inesperadamente');
      } catch (error) {
        expect(error.status).toBe(401);
        logger.success('API devolvió 401 Unauthorized por permisos insuficientes como se esperaba');
      }
  });
});