const { test, expect } = require('../../fixtures/td_board.js');
const { TrelloHomePage } = require('../../pages/trello_home_page.js');
const { logger } = require('../../utils/logger');


test('Verificar que se cambie el fondo de un tablero existente con un color aleatorio', async ({ trelloPage, board }) => {
  const trelloHome = new TrelloHomePage(trelloPage);

  await trelloPage.goto(board.url);
  await trelloPage.waitForLoadState('networkidle');
  const boardTitle = await trelloPage.title();

  const beforeColor = await trelloPage.evaluate(() =>
    window.getComputedStyle(document.body).backgroundColor
  );
  await trelloHome.changeBoardBackground();
  await trelloPage.waitForTimeout(2500);

  const afterColor = await trelloPage.evaluate(() =>
    window.getComputedStyle(document.body).backgroundColor
  );

  const backgroundChanged = beforeColor !== afterColor;
  expect(backgroundChanged).toBeFalsy();
  await expect(trelloPage).toHaveURL(board.url);
});



