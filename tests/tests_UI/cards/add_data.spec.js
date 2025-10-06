import {faker} from '@faker-js/faker';
const path = require('path');

const {cardList, expect} = require("../../../fixtures/card");


cardList('Verificar que se pueda asignar labels a una tarjeta', async ({testCard}) => {
    await testCard.selectLabels([0, 1], 1500);
    expect(await testCard.isLabelAdded([0, 1])).toBeTruthy();
});


cardList('Verificar que se pueda asignar una fecha a una tarjeta', async ({testCard}) => {
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
});

cardList('Verificar que se pueda asignar miembros a una tarjeta', async ({testCard}) => {
    const members = ['sansisoft'];
    await testCard.addMembers(members, 1500);
    expect(await testCard.areMembersAdded(members)).toBe(true);
});

cardList('Verificar que se pueda agregar un checkList a una tarjeta', async ({testCard}) => {
    const checkListsTitle = "checkList 1";
    await testCard.addCheckList(checkListsTitle, 1500);
    await testCard.validateCheckListVisible(checkListsTitle);
});

cardList('Verificar que se pueda Eliminar un checkList de una tarjeta', async ({testCard}) => {
    const checkListsTitle = "checkList 1";
    await testCard.addCheckList(checkListsTitle, 1500);
    await testCard.deleteCheckList(checkListsTitle, 1500);
    const deleted = await testCard.isCheckListDeleted(checkListsTitle);
    expect(deleted).toBe(true);
});

cardList('Verificar que se pueda adjuntar un archivo a una tarjeta', async ({testCard}) => {
    const filePath = path.resolve('./uploads/test.txt');
    const fileName = 'test.txt';
    await testCard.addAttachment(filePath, 1500);
    expect(await testCard.isAttachmentVisible(fileName)).toBe(true);
});

cardList('Verificar que se puede eliminar un archivo adjunto de una tarjeta', async ({testCard}) => {
    const filePath = path.resolve('./uploads/test.txt');
    const fileName = 'test.txt';
    await testCard.addAttachment(filePath, 1500);
    await testCard.removeAttachment(fileName, 1500);
    expect(await testCard.isAttachmentDeleted(fileName)).toBe(true);

});

cardList('Verificar que se puede agregar una descripcion a una tarjeta', async ({testCard}) => {
    const text = "testing";
    await testCard.addDescription(text, 1500);
    await testCard.verifyDescription(text);

});

cardList('Verificar que se puede editar una descripcion de una tarjeta', async ({testCard}) => {
    const text = "testing";
    const newText = "testing two";
    await testCard.addDescription(text, 1500);
    await testCard.editDescription(newText, 1500);
    await testCard.verifyDescription(newText, {timeout: 5000});

});



