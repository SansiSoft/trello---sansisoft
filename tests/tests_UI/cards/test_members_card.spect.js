const {cardList, expect} = require("../../../fixtures/card");

cardList.describe('Card tests - Members', () => {
    cardList('@smoke CD06: Verificar que se pueda asignar miembros a una tarjeta', async ({testCard}) => {
        const members = ['sansisoft'];
        await testCard.addMembers(members, 1500);
        expect(await testCard.areMembersAdded(members)).toBe(true);
        await testCard.closeCard();
    });
});
