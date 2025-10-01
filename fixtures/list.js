const { test: base, expect } = require('@playwright/test');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { logger } = require('../utils/logger');
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
  // crea lista
  list: async ({ board }, use) => {
    const uniqueId = Date.now();
    const listName = `List_Test_${uniqueId}`;
    const listResp = await fetch(
      `https://api.trello.com/1/lists?name=${listName}&idBoard=${board.id}&key=${API_KEY}&token=${API_TOKEN}`,
      { method: 'POST' }
    );
    const list = await listResp.json();
    
    if (list.id) {
      logger.success(`Lista creada exitosamente - ID: ${list.id}, Nombre: ${list.name}, Board: ${board.name}`);
    } else {
      logger.error(`Error al crear lista: ${JSON.stringify(list)}`);
    }

    await use(list);
  },
});

module.exports = { test, expect };

