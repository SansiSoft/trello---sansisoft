const { test } = require('../../../fixtures/list');
const { ListPage } = require('../../../pages/list_page');
const { processTestCases, reportKnownBug, captureUIBug } = require('../../../utils/helpers');
const path = require('path');
const fs = require('fs');

const dataPath = path.resolve(__dirname, '../../../data/list-edit-cases.json');
const rawListCases = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const listCases = processTestCases(rawListCases);

for (const testCase of listCases) {
  test(`@regression ${testCase.id} - ${testCase.title}`, async ({ trelloPage, board, list }, testInfo) => {
    const listPage = new ListPage(trelloPage);

    await trelloPage.goto(board.url);
    const originalName = list.name;

    await listPage.editListName(list.name, testCase.newName);

    if (testCase.id === 2) {
      // Caso vacío; debe permanecer el nombre original
      await listPage.expectListName(originalName);
    } else if (testCase.id === 4) {
      // Caso nombre largo; no debe aceptar más de 512 caracteres
      const expectedName = testCase.newName.substring(0, 512);
      await listPage.expectListName(expectedName);
      const layoutInfo = await listPage.checkLayoutIssues(expectedName);
      if (layoutInfo.hasOverflow) {
        const screenshotFile = await captureUIBug(
          trelloPage,
          `case-${testCase.id}-long-text-overflow`, 
          `Texto largo (${layoutInfo.textLength} chars) causa desbordamiento visual`,
          {},
          testInfo
        ); 
        reportKnownBug({ //definir reporte de bugs
          id: `UI-OVERFLOW-LONG-TEXT-${testCase.id}`,
          title: 'Desbordamiento visual con texto largo en nombres de lista',
          description: `Cuando se usa un nombre de lista de ${layoutInfo.textLength} caracteres (límite: 512), el texto se desborda visualmente del contenedor, afectando la usabilidad aunque la funcionalidad core funciona correctamente.`,
          impact: 'MEDIO - Afecta UX pero no funcionalidad. Usuarios pueden no ver contenido completo o tener dificultades de navegación.',
          evidence: screenshotFile,
          functionalityStatus: 'CORRECTO - Acepta exactamente 512 caracteres como se espera',
          uiStatus: 'DEFECTUOSO - Desbordamiento visual no controlado'
        }); 
      }
      
    } else {
      await listPage.expectListName(testCase.newName);
    }
  });
}

