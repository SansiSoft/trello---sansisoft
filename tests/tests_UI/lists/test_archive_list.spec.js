const { test } = require('../../../fixtures/list');
const { ListPage } = require('../../../pages/list_page');

test.describe('Archivar listas', () => {

  test('@smoke - Archivar lista exitosamente', async ({ trelloPage, board, list }) => {
    const listPage = new ListPage(trelloPage);
    
    await trelloPage.goto(board.url);
    await trelloPage.waitForLoadState('networkidle');

    await listPage.expectListVisible(list.name);
    await listPage.openArchiveListModal(0);
    
    await listPage.expectListArchived(list.name);
  });

  test('@smoke - Deshacer archivo de lista desde el modal', async ({ trelloPage, board, list }) => {
    const listPage = new ListPage(trelloPage);
    
    await trelloPage.goto(board.url);
    await trelloPage.waitForLoadState('networkidle');
    await trelloPage.waitForTimeout(2000);
    
    await listPage.expectListPosition(list.name, 0);
    await listPage.openArchiveListModal(0);
    await listPage.expectListArchived(list.name);
    await listPage.undoArchiveList();
    
    // Verificar que la lista reaparece en su posición original
    await listPage.expectListVisible(list.name);
    await listPage.expectListPosition(list.name, 0);
  });

  test('@positivo - Deshacer archivo de lista con tarjetas', async ({ trelloPage, board, list, card }) => {
    const listPage = new ListPage(trelloPage);
    
    await trelloPage.goto(board.url);
    await trelloPage.waitForLoadState('networkidle');
    await trelloPage.waitForTimeout(2000);
    
    await listPage.expectListVisible(list.name);
    await listPage.expectCardInList(card.name, list.name);
    await listPage.openArchiveListModal(0);
    
    await listPage.expectListArchived(list.name);
    await listPage.undoArchiveList();

    await listPage.expectListVisible(list.name);
    await listPage.expectListPosition(list.name, 0);
    await listPage.expectCardInList(card.name, list.name);
  });

});