const {cardList, expect} = require("../../../fixtures/card");
const {faker} = require("@faker-js/faker");
const checklistData = require('../../../data/checklists.json');
cardList.describe('Card tests - Checklists', () => {
    cardList('@smoke CD03: Verificar que se pueda agregar un checkList a una tarjeta', async ({testCard}) => {
        const checkListsTitle = faker.lorem.sentence({min: 10, max: 15});
        await testCard.addCheckList(checkListsTitle, 1500);
        await testCard.validateCheckListVisible(checkListsTitle);
        await testCard.closeCard();
    });

    cardList('@smoke CD04: Verificar que se pueda Eliminar un checkList de una tarjeta', async ({testCard}) => {
        const checkListsTitle = faker.lorem.sentence({min: 10, max: 15});
        await testCard.addCheckList(checkListsTitle, 1500);
        await testCard.deleteCheckList(checkListsTitle, 1500);
        const deleted = await testCard.isCheckListDeleted(checkListsTitle);
        expect(deleted).toBe(true);
        await testCard.closeCard();
    });

    cardList('@smoke CD05: Verificar creación de múltiples checklists en una tarjeta', async ({testCard}) => {
        for (const checklist of checklistData.checklists) {
            await testCard.addCheckList(checklist.title, 1000);
            await testCard.validateCheckListVisible(checklist.title);
        }
        await testCard.closeCard();
    });

});



