const { test, expect } = require('../../fixtures/create_and_open_card.js');

test('Verificar que se añade un comentario', async ({ card }) => {
  await card.addComment('Mi primer comentario');
  const comments = await card.getCommentsTextOnly();
  expect(comments).toContain('Mi primer comentario');
});


