const {cardList, expect} = require("../../../fixtures/card");

cardList.describe('Card tests - Dates', () => {
    cardList('@smoke CD02: Verificar que se pueda asignar una fecha a una tarjeta', async ({testCard}) => {
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
        await testCard.closeCard();
    });
});
