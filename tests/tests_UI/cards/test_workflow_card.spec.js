const path = require('path');
const {generateCardDescription} = require("../../../utils/helpers");

const {cardList, expect} = require("../../../fixtures/card");
cardList.describe('Card tests - Workflow', () => {
    cardList('@e2e CD15: Verificar flujo completo de edición de tarjeta', async ({testCard}) => {
        await testCard.selectLabels([0, 1], 1500);
        expect(await testCard.isLabelAdded([0, 1])).toBeTruthy();
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(startDate.getMonth() + 1);
        const expectedStartDate = startDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC'
        });
        const expectedEndDate = endDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC'
        });
        const startDateISO = startDate.toISOString().split('T')[0];
        const endDateISO = endDate.toISOString().split('T')[0];
        await testCard.selectDueDate(startDateISO, endDateISO, 1500);
        expect(await testCard.isDueDateSet(expectedStartDate, expectedEndDate)).toBe(true);
        const members = ['sansisoft'];
        await testCard.addMembers(members, 1000);
        expect(await testCard.areMembersAdded(members)).toBe(true);
        const checkListsTitle = "checkList 1";
        await testCard.addCheckList(checkListsTitle, 1500);
        await testCard.validateCheckListVisible(checkListsTitle);
        const filePath = path.resolve('./uploads/test.txt');
        const fileName = 'test.txt';
        await testCard.addAttachment(filePath, 1000);
        expect(await testCard.isAttachmentVisible(fileName)).toBe(true);
        const text = "Descripción de la tarjeta: " + generateCardDescription(20);
        await testCard.addDescription(text, 1000);
        await testCard.verifyDescription(text);
        await testCard.closeCard();
    });

});





