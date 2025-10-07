const { test: base, expect } = require('@playwright/test');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { logger } = require('../utils/logger');
const { generateBoardName, generateListName, generateCardName } = require('../utils/helpers');

require('dotenv').config();

const API_KEY = process.env.TRELLO_KEY;
const API_TOKEN = process.env.TRELLO_TOKEN;

const test = base.extend({
  trelloPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: path.join(__dirname, '../data/storageState.json'),
    });
    const page = await context.newPage();
    await page.goto('https://trello.com');
    await page.waitForLoadState('networkidle');
    await use(page);
    await context.close();
  },
    // crea tablero
    board: async ({}, use) => {
      const uniqueId = Date.now();
      const boardName = `Board_Test_${uniqueId}`;    
      const boardResp = await fetch(
        `https://api.trello.com/1/boards/?name=${boardName}&key=${API_KEY}&token=${API_TOKEN}`,
        { method: 'POST' }
      );
      const board = await boardResp.json();
      
      if (board.id) {
        logger.success(`Tablero creado exitosamente - ID: ${board.id}, Nombre: ${board.name}`);
      } else {
        logger.error(`Error al crear tablero: ${JSON.stringify(board)}`);
      }
      
      await use(board);
      // Cleanup     
      const deleteResp = await fetch(
        `https://api.trello.com/1/boards/${board.id}?key=${API_KEY}&token=${API_TOKEN}`,
        { method: 'DELETE' }
      );
      
      if (deleteResp.ok) {
        logger.success(`Tablero eliminado exitosamente - ID: ${board.id}`);
      } else {
        logger.error(`Error al eliminar tablero - ID: ${board.id}`);
      }
    },


    list: async ({ board }, use) => {
    const listName = generateListName();
    const listResp = await fetch(
      `https://api.trello.com/1/lists?name=${listName}&idBoard=${board.id}&key=${API_KEY}&token=${API_TOKEN}`,
      { method: 'POST' }
    );
    const list = await listResp.json();
    
    if (list.id) {
      logger.success(`Lista creada - ID: ${list.id}, Nombre: ${list.name}, Board: ${board.name}`);
    } else {
      logger.error(`Error al crear lista: ${JSON.stringify(list)}`);
    }

    await use(list);
  },

  cleanupBoard: async ({}, use) => {
    let boardName;

    await use({  registerBoard: (name) => {boardName = name;    }});
    if (boardName) {
      try {
        const searchResp = await fetch(
          `https://api.trello.com/1/members/me/boards?key=${API_KEY}&token=${API_TOKEN}`
        );
        const boards = await searchResp.json();
        const found = boards.find((b) => b.name === boardName);

        if (found) {
          await fetch(
            `https://api.trello.com/1/boards/${found.id}?key=${API_KEY}&token=${API_TOKEN}`,
            { method: 'DELETE' }
          );
          logger.success(`Board eliminado en teardown - ID: ${found.id}, Nombre: ${boardName}`);
        } else {
          logger.warn(`No se encontró el board para eliminar: ${boardName}`);
        }
      } catch (err) {
        logger.error(`Error en teardown de board: ${err.message}`);
      }
    }
  },
    multipleBoards: async ({}, use) => {
    const boards = [];
    // Crear 3 tableros
    for (let i = 1; i <= 3; i++) {
      const uniqueId = Date.now() + i;
      const boardName = `Board_Test_${uniqueId}`;
      const resp = await fetch(
        `https://api.trello.com/1/boards/?name=${boardName}&key=${API_KEY}&token=${API_TOKEN}`,
        { method: 'POST' }
      );
      const board = await resp.json();

      if (board.id) {
        logger.success(`Board ${i} creado - ID: ${board.id}, Nombre: ${board.name}`);
        boards.push(board);
      } else {
        logger.error(`Error al crear board ${i}: ${JSON.stringify(board)}`);
      }
    }

    // Pasar los boards al test
    await use(boards);

    // 🧹 Limpieza
    for (const board of boards) {
      try {
        const deleteResp = await fetch(
          `https://api.trello.com/1/boards/${board.id}?key=${API_KEY}&token=${API_TOKEN}`,
          { method: 'DELETE' }
        );
        if (deleteResp.ok) {
          logger.success(`🧹 Board eliminado - ID: ${board.id}, Nombre: ${board.name}`);
        } else {
          logger.error(`Error al eliminar board - ID: ${board.id}`);
        }
      } catch (err) {
        logger.error(`Error al eliminar board ${board.id}: ${err.message}`);
      }
    }
  },
});


module.exports = { test, expect };
