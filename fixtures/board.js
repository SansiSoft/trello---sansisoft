const { test: base, expect } = require('@playwright/test');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
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
  }
});

module.exports = { test, expect };
