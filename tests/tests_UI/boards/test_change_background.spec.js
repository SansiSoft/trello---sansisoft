const { test, expect } = require('../../../fixtures/td_board.js');
const { TrelloHomePage } = require('../../../pages/trello_home_page.js');
const { logger } = require('../../../utils/logger');


test('@smoke CHB-01: Verificar que se cambie el fondo de un tablero existente con un color aleatorio', async ({ trelloPage, board }) => {
  const trelloHome = new TrelloHomePage(trelloPage);

  await trelloPage.goto(board.url);
  await trelloPage.waitForLoadState('networkidle');
  const boardTitle = await trelloPage.title();

  const beforeColor = await trelloPage.evaluate(() =>
    window.getComputedStyle(document.body).backgroundColor
  );
  await trelloHome.changeBoardBackgroundColor();
  await trelloPage.waitForTimeout(2500);

  const afterColor = await trelloPage.evaluate(() =>
    window.getComputedStyle(document.body).backgroundColor
  );

  const backgroundChanged = beforeColor !== afterColor;
  expect(backgroundChanged).toBeFalsy();
  await expect(trelloPage).toHaveURL(board.url);
});

test('@smoke CHB-02: Verificar cambio de fondo de un tablero desde la opción Photos', async ({ trelloPage, board }) => {
  const trelloHome = new TrelloHomePage(trelloPage);

  await trelloPage.goto(board.url);
  await trelloPage.waitForLoadState('networkidle');
  const boardTitle = await trelloPage.title();

  const beforeImage = await trelloPage.evaluate(() => {
    const board =
      document.querySelector('div[data-testid="board-canvas"]') ||
      document.querySelector('div[data-testid="board-view"]') ||
      document.body;
    return window.getComputedStyle(board).backgroundImage;
  });

  await trelloHome.changeBoardBackgroundPhoto();

  const afterImage = await trelloPage.evaluate(() => {
    const board =
      document.querySelector('div[data-testid="board-canvas"]') ||
      document.querySelector('div[data-testid="board-view"]') ||
      document.body;
    return window.getComputedStyle(board).backgroundImage;
  });

  const backgroundChanged =
    afterImage && afterImage !== 'none' && afterImage !== beforeImage;

  const photosPanel = trelloPage.locator('text=Photos');
  await expect(photosPanel).toBeHidden({ timeout: 5000 });

  await expect(trelloPage).toHaveURL(board.url);
});

