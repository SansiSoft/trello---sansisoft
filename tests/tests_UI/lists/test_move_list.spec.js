const { test } = require('../../../fixtures/list');
const { test: multiTest } = require('../../../fixtures/list'); // Usar el mismo fixture consolidado
const { ListPage } = require('../../../pages/list_page');

test.describe('Mover listas - Tests simples', () => {

  test('@positivo - Mover lista dentro del mismo tablero a otra posición válida', async ({ trelloPage, board, list }) => {
    const listPage = new ListPage(trelloPage);
    
    await trelloPage.goto(board.url);
    await trelloPage.waitForLoadState('networkidle');
    
    await listPage.openMoveListModal(0);
    await listPage.moveList({ position: 3 });
    await listPage.expectListPosition(list.name, 2); // posición 3 = índice 2
  });

  test('@positivo - Cancelar la acción de mover lista desde el modal', async ({ trelloPage, board, list }) => {
    const listPage = new ListPage(trelloPage);
    
    await trelloPage.goto(board.url);
    await trelloPage.waitForLoadState('networkidle');
    
    await listPage.openMoveListModal(0);
    await listPage.cancelMoveListModal();
    await listPage.expectListPosition(list.name, 0);
  });

});

multiTest.describe('Mover listas - Tests con múltiples tableros', () => {

  multiTest('@positivo - Mover lista a otro tablero con listas existentes', async ({ trelloPage, board, targetBoard, list, targetList }) => {
    const listPage = new ListPage(trelloPage);
    await trelloPage.goto(board.url);
    await trelloPage.waitForLoadState('networkidle');
    await trelloPage.waitForTimeout(2000); 
  
    await listPage.expectListPosition(list.name, 0);
    await listPage.openMoveListModal(0);
    await listPage.moveList({ boardName: targetBoard.name, position: 2 });
  });

  multiTest('@positivo - Mover lista a un tablero vacío (posición 1)', async ({ trelloPage, board, targetBoard, list }) => {
    const listPage = new ListPage(trelloPage);
    
    // Ir al tablero origen 
    await trelloPage.goto(board.url);
    await trelloPage.waitForLoadState('networkidle');
    await trelloPage.waitForTimeout(2000);
    
    await listPage.openMoveListModal(0);
    await listPage.moveList({ boardName: targetBoard.name });
    
  });

  multiTest('@positivo - Verificar que las tarjetas se mueven junto con la lista', async ({ trelloPage, board, targetBoard, list, card }) => {
    const listPage = new ListPage(trelloPage);
    // Ir al tablero origen
    await trelloPage.goto(board.url);
    await trelloPage.waitForLoadState('networkidle');
    await trelloPage.waitForTimeout(2000);
    
    // Verificar que la tarjeta existe en la lista original
    await listPage.expectCardInList(card.name, list.name);
    
    await listPage.openMoveListModal(0);
    await listPage.moveList({ boardName: targetBoard.name });
  });

});
