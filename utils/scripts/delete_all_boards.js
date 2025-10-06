// delete_all_boards.js
const { logger } = require('../logger');


const BASE_URL = 'https://api.trello.com/1';
const apiKey = process.env.TRELLO_KEY;
const apiToken = process.env.TRELLO_TOKEN;

if (!apiKey || !apiToken) {
  logger.error('❌ Faltan credenciales de API: TRELLO_KEY o TRELLO_TOKEN');
  process.exit(1);
}

/**
 * Elimina un tablero por ID
 */
async function deleteBoard(boardId) {
  logger.info(`Eliminando tablero: ${boardId}...`);
  const response = await fetch(`${BASE_URL}/boards/${boardId}?key=${apiKey}&token=${apiToken}`, {
    method: 'DELETE',
  });

  const text = await response.text();
  if (!response.ok) {
    logger.error(`No se pudo eliminar el tablero (${response.status}) → ${text}`);
  } else {
    logger.success(`Tablero eliminado correctamente: ${boardId}`);
  }
}

/**
 * Elimina todos los tableros del usuario actual
 */
async function deleteAllBoards() {
  logger.info('Buscando todos los tableros...');

  const response = await fetch(`${BASE_URL}/members/me/boards?key=${apiKey}&token=${apiToken}`);
  const text = await response.text();

  if (!response.ok) {
    logger.error(`Falló la petición (${response.status}): ${text}`);
    process.exit(1);
  }

  let boards;
  try {
    boards = JSON.parse(text);
  } catch {
    logger.error(`Respuesta no es JSON válida: ${text}`);
    process.exit(1);
  }

  if (!boards || boards.length === 0) {
    logger.info('No se encontraron tableros para eliminar.');
    return;
  }

  logger.info(`Se encontraron ${boards.length} tableros. Eliminando...`);

  for (const board of boards) {
    await deleteBoard(board.id);
  }

  logger.success('🎉 Todos los tableros fueron eliminados exitosamente.');
}
deleteAllBoards().catch((err) => {
  logger.error(`❌ Error general: ${err.message}`);
  process.exit(1);
});
