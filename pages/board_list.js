class BoardList {
    constructor(page){
        this.page= page;
        this.firstBoard = this.page.locator('section[data-testid="workspace-boards-list-section"] a').first();
    }

    async openFirstBoard(){
        await this.firstBoard.click();
    }
}

module.exports = { BoardList };