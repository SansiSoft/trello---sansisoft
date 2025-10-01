const { faker } = require('@faker-js/faker');

// En Faker v8+ no se puede cambiar el locale después de la importación
// Se usa el locale por defecto (en)

/**
 * Procesa placeholders especiales en datos de test cases
 * Soporta:
 * - REPEAT:caracter:cantidad - Repite un caracter X veces
 * - FAKER:tipo - Genera datos aleatorios con faker
 * - SPECIAL:tipo - Genera caracteres especiales
 * - EMPTY - String vacío
 * 
 * @param {Object} testCase - Caso de test a procesar
 * @returns {Object} - Caso de test procesado
 */
function processTestCaseData(testCase) {
  const processedCase = { ...testCase };
  
  // Procesar placeholder REPEAT:caracter:cantidad
  if (typeof processedCase.newName === 'string' && processedCase.newName.startsWith('REPEAT:')) {
    const [, char, count] = processedCase.newName.split(':');
    const numCount = parseInt(count);
    processedCase.newName = char.repeat(numCount);
  }
  
  // Procesar placeholder FAKER:tipo
  else if (typeof processedCase.newName === 'string' && processedCase.newName.startsWith('FAKER:')) {
    const [, type] = processedCase.newName.split(':');
    
    switch (type) {
      case 'listName':
        processedCase.newName = `Lista ${faker.word.adjective()} ${faker.number.int({ min: 1, max: 999 })}`;
        break;
      case 'word':
        processedCase.newName = faker.word.noun();
        break;
      case 'sentence':
        processedCase.newName = faker.lorem.sentence(3);
        break;
      case 'company':
        processedCase.newName = faker.company.name();
        break;
      case 'product':
        processedCase.newName = faker.commerce.productName();
        break;
      default:
        processedCase.newName = faker.word.noun();
    }
  }
  
  // Procesar placeholder SPECIAL:tipo
  else if (typeof processedCase.newName === 'string' && processedCase.newName.startsWith('SPECIAL:')) {
    const [, type] = processedCase.newName.split(':');
    
    switch (type) {
      case 'symbols':
        processedCase.newName = '!@#$% Lista ^&*()';
        break;
      case 'mixed':
        processedCase.newName = `${faker.word.noun()} !@# ${faker.number.int({ min: 1, max: 99 })} $%^`;
        break;
      case 'unicode':
        processedCase.newName = 'Lista ñáéíóú ¡¿';
        break;
      case 'numbers':
        processedCase.newName = `Lista ${faker.number.int({ min: 1000, max: 9999 })}`;
        break;
      default:
        processedCase.newName = '!@#$% Lista ^&*()';
    }
  }
  
  // Procesar placeholder EMPTY
  else if (typeof processedCase.newName === 'string' && processedCase.newName === 'EMPTY') {
    processedCase.newName = '';
  }
  
  return processedCase;
}

/**
 * Procesa una lista de casos de test aplicando transformaciones de placeholders
 * 
 * @param {Array} testCases - Array de casos de test
 * @returns {Array} - Array de casos de test procesados
 */
function processTestCases(testCases) {  
  const processedCases = testCases.map((testCase, index) => {
    return processTestCaseData(testCase);
  });
  
  return processedCases;
}

/**
 * Reporta un bug conocido sin fallar el test
 * @param {Object} bugInfo - Información del bug
 * @param {string} bugInfo.id - ID del bug
 * @param {string} bugInfo.title - Título del bug
 * @param {string} bugInfo.description - Descripción detallada
 * @param {string} bugInfo.impact - Impacto en el usuario
 * @param {string} bugInfo.evidence - Archivo de evidencia (screenshot)
 */
function reportKnownBug(bugInfo) {
  const timestamp = new Date().toISOString();
  
  console.warn(`
===== BUG REPORT =====
Timestamp: ${timestamp}
ID: ${bugInfo.id}
Título: ${bugInfo.title}
Descripción: ${bugInfo.description}
Impacto: ${bugInfo.impact}
Evidencia: ${bugInfo.evidence || 'No disponible'}
Estado: CONOCIDO - No falla funcionalidad core
========================
  `);
}

/**
 * Capturar screenshot para documentar bugs o problemas de UI
 * @param {Page} page - Página de Playwright
 * @param {string} testName - Nombre descriptivo del test/problema
 * @param {string} description - Descripción del problema
 * @param {Object} options - Opciones adicionales para el screenshot
 * @param {TestInfo} testInfo - Información del test de Playwright (opcional, para adjuntar al reporte)
 * @returns {Promise<string|null>} - Nombre del archivo generado o null si hay error
 */
async function captureUIBug(page, testName, description, options = {}, testInfo = null) {
  const { logger } = require('./logger');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `ui-bug-${testName}-${timestamp}.png`;
  
  const defaultOptions = {
    path: `test-results/${filename}`,
    fullPage: true,
    ...options
  };
  
  try {
    // Capturar screenshot
    const screenshotBuffer = await page.screenshot(defaultOptions);
    
    // Si se proporciona testInfo, adjuntar la imagen al reporte HTML
    if (testInfo) {
      await testInfo.attach(`UI Bug: ${description}`, {
        body: screenshotBuffer,
        contentType: 'image/png',
      });
    }
    
    logger.warn(`Screenshot capturado: ${filename}`);
    logger.warn(`   Descripción: ${description}`);
    logger.info(`   Ubicación: ${defaultOptions.path}`);
    
    return filename;
  } catch (error) {
    logger.error(`Error capturando screenshot: ${error.message}`);
    return null;
  }
}


module.exports = {
  processTestCaseData,
  processTestCases,
  reportKnownBug,
  captureUIBug,
};