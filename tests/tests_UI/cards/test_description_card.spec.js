const {cardList} = require("../../../fixtures/card");
const {generateCardDescription} = require("../../../utils/helpers");

cardList.describe('Card tests - Descriptions', () => {
    cardList('@smoke CD09: Verificar que se puede agregar una descripcion a una tarjeta', async ({testCard}) => {
        const text = generateCardDescription('random');
        await testCard.addDescription(text, 1500);
        await testCard.verifyDescription(text);
        await testCard.closeCard();
    });

    cardList('@smoke CD10: Validar que se pueda agregar descripción con caracteres especiales', async ({testCard}) => {
        const text = generateCardDescription('specialChars');
        await testCard.addDescription(text, 1500);
        await testCard.verifyDescription(text);
        await testCard.closeCard();
    });

    cardList('@smoke CD11: Validar que se puede agregar una descripción muy larga', async ({testCard}) => {
        const text = generateCardDescription('long');
        await testCard.addDescription(text, 1500);
        await testCard.verifyDescription(text);
        await testCard.closeCard();
    });

    cardList('@smoke CD12: Verificar que se puede editar una descripcion de una tarjeta', async ({testCard}) => {
        const text = generateCardDescription('random');
        const newText = generateCardDescription('random');
        await testCard.addDescription(text, 1500);
        await testCard.editDescription(newText, 1500);
        await testCard.verifyDescription(newText, {timeout: 5000});
        await testCard.closeCard();
    });

    cardList('@smoke CD13: Validar que se pueda agregar descripción con emojis', async ({testCard}) => {
        const text = generateCardDescription('emojis');
        await testCard.addDescription(text, 1500);
        await testCard.verifyDescription(text);
        await testCard.closeCard();
    });

    cardList('@smoke CD14: Verificar descripción con URLs y emails', async ({testCard}) => {
        const text = generateCardDescription('urls');
        await testCard.addDescription(text, 1500);
        await testCard.verifyDescription(text);
        await testCard.closeCard();
    });
});

