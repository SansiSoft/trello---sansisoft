const { test, expect } = require('../../../fixtures/create_and_open_card.js');
const path = require('path');
const fs = require('fs');

const testCasesPath = path.resolve(__dirname, '../../../data/add-comments-cases.json');
const listTestCases = JSON.parse(fs.readFileSync(testCasesPath, 'utf-8') );

const testToRun = listTestCases.find(tc => tc.id == 1);

for (const testCase of listTestCases) {
  test(`CC-${testCase.id} - ${testCase.title} @positivo`, async ({ card }) => {
    await card.addComment(testCase.comment);
    const actualComments = await card.getCommentsTextOnly();
    const actualText = actualComments.join('\n'); 
    expect(actualText).toContain(testCase.comment);
  });
}
