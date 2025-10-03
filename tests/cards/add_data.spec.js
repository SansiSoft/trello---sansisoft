const { testTwo, expect } = require("../../fixtures/card");


testTwo('Verificar que se pueda asignar labels a una tarjeta', async ({ cardTwo }) => {
    await cardTwo.selectLabels([0,1], 1500);
    expect(await cardTwo.isLabelAdded([0,1])).toBeTruthy();
});

