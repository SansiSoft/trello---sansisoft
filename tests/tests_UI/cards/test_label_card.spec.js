const {cardList, expect} = require("../../../fixtures/card");

cardList.describe('Card tests - Labels', () => {
    cardList('@smoke CD01: Verificar que se pueda asignar labels a una tarjeta', async ({testCard}) => {
        await testCard.selectLabels([0, 1], 1500);
        expect(await testCard.isLabelAdded([0, 1])).toBeTruthy();
        await testCard.closeCard();
    });
});
