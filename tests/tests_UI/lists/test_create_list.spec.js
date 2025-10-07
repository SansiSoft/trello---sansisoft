const { test, expect } = require('../../../fixtures/list');
const { ListPage } = require('../../../pages/list_page');
const { processTestCases, reportKnownBug, captureUIBug } = require('../../../utils/helpers');
const path = require('path');
const fs = require('fs');

const dataPath = path.resolve(__dirname, '../../../data/list-create-cases.json');
const rawListCases = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const createCases = processTestCases(rawListCases);

for (const testCase of createCases) {
  const marksString = testCase.marksUI?.map(mark => `@${mark}`).join(' ') || '';
  test(`${marksString} ${testCase.id} - ${testCase.title}`, async ({ trelloPage, board }, testInfo) => {
    const listPage = new ListPage(trelloPage);

    // Ir al tablero creado en el fixture
    await trelloPage.goto(board.url);

    // Ejecutar acción de crear lista
    await listPage.createList(testCase.newName);

    // Validaciones por caso
    if (testCase.id === 2) {
      // Caso vacío → no debería crearse lista
      const listLocator = listPage.listByName(testCase.newName === 'EMPTY' ? '' : testCase.newName);
      await expect(listLocator, `La lista "${testCase.newName}" no debería haberse creado`).toHaveCount(3);
    } else if (testCase.id === 4) {
      // Caso nombre largo → validar truncado a 512 chars
      const expectedName = testCase.newName.substring(0, 512);
      const listLocator = listPage.listByName(expectedName);
      await expect(listLocator, 'El nombre de la lista truncada no coincide').toHaveText(expectedName, { timeout: 10000 });

      // Revisión visual: overflow por nombre largo
      const layoutInfo = await listPage.checkLayoutIssues(expectedName);
      if (layoutInfo.hasOverflow) {
        const screenshotFile = await captureUIBug(
          trelloPage,
          `case-${testCase.id}-long-text-overflow`,
          `Texto largo (${layoutInfo.textLength} chars) causa desbordamiento visual`,
          {},
          testInfo
        );
        reportKnownBug({
          id: `UI-OVERFLOW-LONG-TEXT-${testCase.id}`,
          title: 'Desbordamiento visual en nombres largos de lista',
          description: `Al usar un nombre de lista de ${layoutInfo.textLength} caracteres (máx 512), el texto se desborda visualmente aunque la funcionalidad funciona.`,
          impact: 'MEDIO - UX afectada, no funcionalidad.',
          evidence: screenshotFile,
          functionalityStatus: 'CORRECTO',
          uiStatus: 'DEFECTUOSO'
        });
      }
    } else if (testCase.id === 13) {
      // Caso cancelar → no debería aparecer la lista
      const listLocator = listPage.listByName(testCase.newName === 'CANCEL:createList' ? '' : testCase.newName);
      await expect(listLocator, `La lista "${testCase.newName}" no debería haberse creado`).toHaveCount(3);
    } else {
      // Todos los demás → debería aparecer la lista
      const listLocator = listPage.listByName(testCase.newName);
      await expect(listLocator, 'El nombre de la lista creada no coincide').toHaveText(testCase.newName, { timeout: 10000 });
    }
  });
}

