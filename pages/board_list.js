class BoardList {
  constructor(page) {
    this.page = page;
    this.boards = this.page.locator('section[data-testid="workspace-boards-list-section"] a');
    this.searchInput = this.page.locator('input[placeholder="Search boards"]');
    this.moreBoardsButton = this.page.getByRole('button', { name: 'Load more boards' });
    this.firstBoard = this.boards.first();
  }

  async openFirstBoard() {
    await this.firstBoard.click();
  }

async loadMoreBoards() {
    while (await this.moreBoardsButton.isVisible()) {
       await this.moreBoardsButton.click();
       await this.page.waitForTimeout(500);
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