const { logger } = require("../utils/logger");

class BoardList {
  constructor(page) {
    this.page = page;
    this.boards = this.page.locator('section[data-testid="workspace-boards-list-section"] a');
    this.searchInput = this.page.locator('input[placeholder="Search boards"]');
   this.moreBoardsButton = this.page.locator('button:has-text("Load more boards")');
    this.firstBoard = this.boards.first();
  }

  async openFirstBoard() {
    await this.firstBoard.click();
  }

async loadMoreBoards() {
  const button = this.moreBoardsButton;
  await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await this.page.waitForTimeout(1000);
  logger.info(`Verificando si el boton de cargar mas Tableros esta habilitado`);
  if(await button.isVisible()){
     logger.info(`Boton habilitado: existen varios tableros`);
    while (await button.count() > 0 && await button.isVisible()) {
    logger.info("Haciendo click en 'Load more boards'");
    await button.click();
    await this.page.waitForTimeout(800);
    logger.success("Ya no hay más tableros que cargar");

  }
  }else{
    logger.success("Todos los tableros se ven en la pagina de tableros")
  }
}

 
  async searchBoardByName(boardName) {
    await this.searchInput.fill(boardName);
    await this.page.waitForTimeout(1000);
  }


  async openBoardByName(boardName) {
    const board = this.boards.filter({ hasText: boardName });
    await board.first().click();
  }

//   async openBoardByIndex(index) {
//     await this.boards.nth(index).click();
//   }

//   async getBoardNames() {
//     return await this.boards.allInnerTexts();
//   }
}

module.exports = { BoardList };