const { test: base, expect } = require('@playwright/test');
const { logger } = require('../utils/logger');
const { generateBoardName, generateListName } = require('../utils/helpers');
const TrelloAPI = require('../utils/trello_api');
require('dotenv').config();

const API_KEY = process.env.TRELLO_KEY;
const API_TOKEN = process.env.TRELLO_TOKEN;
const TRELLO_API_BASE = process.env.TRELLO_API_URL;

const test = base.extend({
  apiContext: async ({}, use) => {
    const api = new TrelloAPI({ key: API_KEY, token: API_TOKEN, baseUrl: TRELLO_API_BASE, logger });

    const context = {
      api,
      request: api.request.bind(api),
      updateList: api.updateList.bind(api),
      getList: api.getList.bind(api),
      getBoardLists: api.getBoardLists.bind(api),
      verifyToken: api.verifyToken.bind(api),
    };

    try {
      if (!API_KEY || !API_TOKEN) {
        throw new Error('Missing TRELLO_KEY or TRELLO_TOKEN in environment.');
      }
      await api.verifyToken();
    } catch (err) {
      logger.error(`API fixture verification failed: ${err.message}`);
      throw err;
    }

    await use(context);
  },

  // Tablero 
  apiBoard: async ({ apiContext }, use) => {
    const boardName = generateBoardName();
    
    const board = await apiContext.request('/boards', {
      method: 'POST',
      params: { name: boardName }
    });
    
    if (board.id) {
      logger.success(`API: Tablero creado - ID: ${board.id}, Nombre: ${board.name}`);
    } else {
      logger.error(`API: Error al crear tablero: ${JSON.stringify(board)}`);
    }
    
    await use(board);
    
    // Cleanup
    try {
      await apiContext.request(`/boards/${board.id}`, { method: 'DELETE' });
      logger.success(`API: Tablero eliminado - ID: ${board.id}`);
    } catch (error) {
      logger.error(`API: Error al eliminar tablero - ID: ${board.id}: ${error.message}`);
    }
  },

  // Lista 
  apiList: async ({ apiContext, apiBoard }, use) => {
    const listName = generateListName();
    
    const list = await apiContext.request('/lists', {
      method: 'POST',
      params: { 
        name: listName,
        idBoard: apiBoard.id
      }
    });
    
    if (list.id) {
      logger.success(`API: Lista creada - ID: ${list.id}, Nombre: ${list.name}, Board: ${apiBoard.name}`);
    } else {
      logger.error(`API: Error al crear lista: ${JSON.stringify(list)}`);
    }

    await use(list);
  },
});

module.exports = { test, expect };