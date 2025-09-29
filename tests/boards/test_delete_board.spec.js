const { test, expect } = require('../../fixtures/login.js');
const { TrelloHomePage } = require('../../pages/trello_home_page.js');

test('Verificar que se elimine el tablero', async ({ trelloPage }) => {
    const trelloHome = new TrelloHomePage(trelloPage);
    const boardName = 'Prueba para eliminar un board' ;

    await trelloHome.createANewBoard(boardName);
    
    await trelloPage.locator('[aria-label="Show menu"]').click();
    await trelloPage.getByRole('button', { name: /close board|cerrar tablero/i }).click();
    await trelloPage.getByRole('button', { name: /^close$|^cerrar$/i }).click();

    await expect(trelloPage.getByText(/this board is closed/i)).toBeVisible({ timeout: 10000 });

    await trelloPage.locator('[aria-label="Show menu"]').click();
    await trelloPage.getByRole('button', { name: /permanently delete board|eliminar permanentemente/i }).click();
    await trelloPage.getByRole('button', { name: /^delete$|^eliminar$/i }).click();

    //await expect(trelloPage).not.toHaveURL(/\/b\//);
});