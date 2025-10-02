const { test: base, expect } = require('@playwright/test');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
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

  // Tablero principal con lista
  board: async ({}, use) => {
    const boardName = generateBoardName();    
    const boardResp = await fetch(
      `https://api.trello.com/1/boards/?name=${boardName}&key=${API_KEY}&token=${API_TOKEN}`,
      { method: 'POST' }
    );
    const board = await boardResp.json();
    
    if (board.id) {
      logger.success(`Tablero principal creado - ID: ${board.id}, Nombre: ${board.name}`);
    } else {
      logger.error(`Error al crear tablero principal: ${JSON.stringify(board)}`);
    }
    
    await use(board);
    
    // Cleanup     
    const deleteResp = await fetch(
      `https://api.trello.com/1/boards/${board.id}?key=${API_KEY}&token=${API_TOKEN}`,
      { method: 'DELETE' }
    );
    
    if (deleteResp.ok) {
      logger.success(`Tablero principal eliminado - ID: ${board.id}`);
    } else {
      logger.error(`Error al eliminar tablero principal - ID: ${board.id}`);
    }
  },

  // Segundo tablero para tests de movimiento entre tableros
  targetBoard: async ({}, use) => {
    const boardName = generateBoardName();    
    const boardResp = await fetch(
      `https://api.trello.com/1/boards/?name=${boardName}&key=${API_KEY}&token=${API_TOKEN}`,
      { method: 'POST' }
    );
    const targetBoard = await boardResp.json();
    
    if (targetBoard.id) {
      logger.success(`Tablero destino creado - ID: ${targetBoard.id}, Nombre: ${targetBoard.name}`);
    } else {
      logger.error(`Error al crear tablero destino: ${JSON.stringify(targetBoard)}`);
    }
    
    await use(targetBoard);
    
    // Cleanup     
    const deleteResp = await fetch(
      `https://api.trello.com/1/boards/${targetBoard.id}?key=${API_KEY}&token=${API_TOKEN}`,
      { method: 'DELETE' }
    );
    
    if (deleteResp.ok) {
      logger.success(`Tablero destino eliminado - ID: ${targetBoard.id}`);
    } else {
      logger.error(`Error al eliminar tablero destino - ID: ${targetBoard.id}`);
    }
  },

  // Lista en el tablero principal
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

  // Lista adicional en el tablero destino para tests que necesitan listas existentes
  targetList: async ({ targetBoard }, use) => {
    const listName = generateListName();
    const listResp = await fetch(
      `https://api.trello.com/1/lists?name=${listName}&idBoard=${targetBoard.id}&key=${API_KEY}&token=${API_TOKEN}`,
      { method: 'POST' }
    );
    const targetList = await listResp.json();
    
    if (targetList.id) {
      logger.success(`Lista destino creada - ID: ${targetList.id}, Nombre: ${targetList.name}, Board: ${targetBoard.name}`);
    } else {
      logger.error(`Error al crear lista destino: ${JSON.stringify(targetList)}`);
    }

    await use(targetList);
  },

  // Card para tests que verifican que las tarjetas se mueven con la lista
  card: async ({ list }, use) => {
    const cardName = generateCardName();
    const cardResp = await fetch(
      `https://api.trello.com/1/cards?name=${cardName}&idList=${list.id}&key=${API_KEY}&token=${API_TOKEN}`,
      { method: 'POST' }
    );
    const card = await cardResp.json();
    
    if (card.id) {
      logger.success(`Tarjeta creada - ID: ${card.id}, Nombre: ${card.name}, Lista: ${list.name}`);
    } else {
      logger.error(`Error al crear tarjeta: ${JSON.stringify(card)}`);
    }

    await use(card);
  },
});

module.exports = { test, expect };