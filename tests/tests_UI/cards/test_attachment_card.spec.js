const path = require('path');

const {cardList, expect} = require("../../../fixtures/card");
cardList.describe('Card tests - Attachments', () => {
    cardList('@smoke CD07: Verificar que se pueda adjuntar un archivo a una tarjeta', async ({testCard}) => {
        const filePath = path.resolve('./uploads/test.txt');
        const fileName = 'test.txt';
        await testCard.addAttachment(filePath, 1500);
        expect(await testCard.isAttachmentVisible(fileName)).toBe(true);
        await testCard.closeCard();
    });

    cardList('@smoke CD08: Verificar que se puede eliminar un archivo adjunto de una tarjeta', async ({testCard}) => {
        const filePath = path.resolve('./uploads/test.txt');
        const fileName = 'test.txt';
        await testCard.addAttachment(filePath, 2000);
        await testCard.removeAttachment(fileName, 1500);
        expect(await testCard.isAttachmentDeleted(fileName)).toBe(true);
        await testCard.closeCard();
    });
});

