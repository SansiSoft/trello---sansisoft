const { test, expect } = require('../../fixtures/list');
const { generateListName, generateBoardName } = require('../../utils/helpers');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { logger } = require('../../utils/logger');
const { reportKnownBug } = require('../../utils/helpers');
const { faker } = require('@faker-js/faker');

const fakeId = faker.string.uuid();

const API_KEY = process.env.TRELLO_KEY;
const API_TOKEN = process.env.TRELLO_TOKEN;

test.describe('API - Crear listas en Trello', () => {

    test('Crear lista con nombre válido', async ({ board }) => {
        const listName = generateListName();
        const response = await fetch(
        `https://api.trello.com/1/lists?name=${encodeURIComponent(listName)}&idBoard=${board.id}&key=${API_KEY}&token=${API_TOKEN}`,
        { method: 'POST' }
        );
        const list = await response.json();

        expect(list.idBoard).toBe(board.id);
        expect(list.name).toBe(listName);
        
        if (list.id) {
            logger.success(`Lista API creada con ID: ${list.id} y nombre: ${list.name}`);
        } else {
            logger.error(`Error al crear lista: ${JSON.stringify(list)}`);
        }

    });

    test('Crear lista con nombre vacío → error esperado', async ({ board }) => {
        const response = await fetch(
        `https://api.trello.com/1/lists?name=&idBoard=${board.id}&key=${API_KEY}&token=${API_TOKEN}`,
        { method: 'POST' }
        );
        expect(response.status, `Status inesperado: ${response.status}`).toBe(400);

        // Leer como texto plano (no JSON)
        const bodyText = await response.text();

        // Validar que el mensaje contenga algo como "invalid" o "name"
        expect(bodyText.toLowerCase()).toMatch(/invalid|name|error/);

        logger.error(`Respuesta esperada (400) al crear lista vacía: ${bodyText}`);
    });

    test('Crear lista con nombre duplicado', async ({ board }) => {
        const listName = generateListName();

        // Crear la primera
        const firstList = await fetch(
        `https://api.trello.com/1/lists?name=${encodeURIComponent(listName)}&idBoard=${board.id}&key=${API_KEY}&token=${API_TOKEN}`,
        { method: 'POST' }
        );
        const list = await firstList.json();
        expect(list.idBoard).toBe(board.id);
        expect(list.name).toBe(listName);
        logger.success(`Primera lista creada: ${list.name}`);

        // Crear la segunda (duplicada)
        const duplicateResp = await fetch(
        `https://api.trello.com/1/lists?name=${encodeURIComponent(listName)}&idBoard=${board.id}&key=${API_KEY}&token=${API_TOKEN}`,
        { method: 'POST' }
        );
        const duplicateData = await duplicateResp.json();
        expect(duplicateData.idBoard).toBe(board.id);
        expect(duplicateData.name).toBe(listName);
        logger.success(`Lista duplicada creada: ${duplicateData.name}`);
    });

    // test('Crear lista con nombre muy largo', async ({ board }) => {
    //     test.fail(true, 'BUG conocido: la API permite nombres > 512 chars');
    //     const longName = 'L'.repeat(600); // 600 chars
    //     const response = await fetch(
    //     `https://api.trello.com/1/lists?name=${encodeURIComponent(longName)}&idBoard=${board.id}&key=${API_KEY}&token=${API_TOKEN}`,
    //     { method: 'POST' }
    //     );
    //     const data = await response.json();
    //     logger(`Longitud del nombre: ${longName.length}`);
    //     // Trello generalmente permite hasta 512 chars, pero verificamos la respuesta
    //     expect(data.name.length).toBeLessThanOrEqual(512);
    //     if (data.name.length > 512) {
    //         // Reportar bug conocido
    //         reportKnownBug({
    //         id: 'BUG-LONG-LIST-NAME',
    //         title: 'Se permite crear lista con nombre > 512 caracteres',
    //         description: `Se creó una lista con nombre de ${data.name.length} caracteres. Debería truncarse o fallar.`,
    //         impact: 'MEDIO - UX afectada, no funcionalidad core',
    //         evidence: JSON.stringify(data)
    //         });
    //     }
    // });

    test('Crear lista con nombre muy largo', async ({ board, trelloPage}, testInfo ) => {
        logger.info(`BUG CONOCIDO: la API permite nombres > 512 chars`);
        const longName = 'L'.repeat(600); // 600 chars
        const response = await fetch(
            `https://api.trello.com/1/lists?name=${encodeURIComponent(longName)}&idBoard=${board.id}&key=${API_KEY}&token=${API_TOKEN}`,
            { method: 'POST' }
        );

        let data;
        try {
            data = await response.json();
        } catch {
            data = { raw: await response.text() }; // Si no es JSON, guardamos el texto
        }

        logger.info(`Longitud del nombre enviado: ${longName.length}`);

        // Validación funcional (esperamos que la longitud máxima sea 512)
        const exceededLimit = data.name && data.name.length > 512;
        test.fail(exceededLimit, 'BUG conocido: la API permite nombres > 512 chars');
        
        if (exceededLimit) {
            // Capturar evidencia visual si es UI (opcional, si tienes trelloPage)
            const screenshotFile = captureUIBug(trelloPage,
                'long-list-name', 
                `Nombre de lista excede 512 chars`, 
                {}, 
                testInfo
            );

            // Reportar bug conocido
            reportKnownBug({
                id: 'BUG-LONG-LIST-NAME',
                title: 'Se permite crear lista con nombre > 512 caracteres',
                description: `Se creó una lista con nombre de ${data.name.length} caracteres. Debería truncarse o rechazarse.`,
                impact: 'MEDIO - UX afectada, no funcionalidad core',
                evidence: screenshotFile || JSON.stringify(data)
            });
        }        

        // Assert para que el test falle si el límite se excede
        expect(data.name.length).toBeLessThanOrEqual(512);
    });


    test('Crear lista con boardId inválido → error', async () => {
        const invalidBoardId = fakeId;
        const listName = generateListName();

        const response = await fetch(
        `https://api.trello.com/1/lists?name=${encodeURIComponent(listName)}&idBoard=${invalidBoardId}&key=${API_KEY}&token=${API_TOKEN}`,
        { method: 'POST' }
        );
        const text = await response.text();
        let data;

        // Intentar parsear a JSON (si aplica)
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }

        // 🔍 Validar el código de estado
        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.status).toBeLessThan(500);
        logger.info(`Respuesta al usar boardId inválido: ${JSON.stringify(data)}`);
    });

});
