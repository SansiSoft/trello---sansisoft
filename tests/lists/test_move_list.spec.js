const { test } = require('../../fixtures/list');
const { test: multiTest } = require('../../fixtures/list'); // Usar el mismo fixture consolidado
const { ListPage } = require('../../pages/list_page');

test.describe('Mover listas - Tests simples', () => {

  test('1 - Mover lista dentro del mismo tablero a otra posición válida', async ({ trelloPage, board, list }) => {
    const listPage = new ListPage(trelloPage);
    
    await trelloPage.goto(board.url);
    await trelloPage.waitForLoadState('networkidle');
    
    await listPage.openMoveListModal(0);
    await listPage.moveList({ position: 3 });
    await listPage.expectListPosition(list.name, 2); // posición 3 = índice 2
  });

  test('2 - Cancelar la acción de mover lista desde el modal', async ({ trelloPage, board, list }) => {
    const listPage = new ListPage(trelloPage);
    
    await trelloPage.goto(board.url);
    await trelloPage.waitForLoadState('networkidle');
    
    await listPage.openMoveListModal(0);
    await listPage.cancelMoveListModal();
    await listPage.expectListPosition(list.name, 0);
  });

});

multiTest.describe('Mover listas - Tests con múltiples tableros', () => {

  multiTest('3 - Mover lista a otro tablero con listas existentes', async ({ trelloPage, board, targetBoard, list, targetList }) => {
    const listPage = new ListPage(trelloPage);
    await trelloPage.goto(board.url);
    await trelloPage.waitForLoadState('networkidle');
    await trelloPage.waitForTimeout(2000); 
  
    await listPage.expectListPosition(list.name, 0);
    await listPage.openMoveListModal(0);
    await listPage.moveList({ boardName: targetBoard.name, position: 2 });
    
    // Navegar al tablero destino 
    await trelloPage.goto(targetBoard.url);
    await trelloPage.waitForLoadState('networkidle');
    await trelloPage.waitForTimeout(3000);
    
    // Verificar que la lista existe en el tablero destino
    await listPage.expectListPosition(list.name, 1); // posición 2 = índice 1
  });

  multiTest('4 - Mover lista a un tablero vacío (posición 1)', async ({ trelloPage, board, targetBoard, list }) => {
    const listPage = new ListPage(trelloPage);
    
    // Ir al tablero origen 
    await trelloPage.goto(board.url);
    await trelloPage.waitForLoadState('networkidle');
    await trelloPage.waitForTimeout(2000);
    
    await listPage.openMoveListModal(0);
    await listPage.moveList({ boardName: targetBoard.name });
    
    // Navegar al tablero destino y verificar que quedó en posición 1
    await trelloPage.goto(targetBoard.url);
    await trelloPage.waitForLoadState('networkidle');
    await trelloPage.waitForTimeout(3000);
    await listPage.expectListPosition(list.name, 0);
  });

  multiTest('5 - Verificar que las tarjetas se mueven junto con la lista', async ({ trelloPage, board, targetBoard, list, card }) => {
    const listPage = new ListPage(trelloPage);
    // Ir al tablero origen
    await trelloPage.goto(board.url);
    await trelloPage.waitForLoadState('networkidle');
    await trelloPage.waitForTimeout(2000);
    
    // Verificar que la tarjeta existe en la lista original
    await listPage.expectCardInList(card.name, list.name);
    
    await listPage.openMoveListModal(0);
    await listPage.moveList({ boardName: targetBoard.name });
    
    // Navegar al tablero destino y verificar que la tarjeta se movió con la lista
    await trelloPage.goto(targetBoard.url);
    await trelloPage.waitForLoadState('networkidle');
    await trelloPage.waitForTimeout(3000);
    await listPage.expectCardInList(card.name, list.name);
  });

});
