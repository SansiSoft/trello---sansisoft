
import { faker } from '@faker-js/faker';

const { cardList, expect } = require("../../fixtures/card");


cardList('Verificar que se pueda asignar labels a una tarjeta', async ({ testCard }) => {
    await testCard.selectLabels([0,1], 1500);
    expect(await testCard.isLabelAdded([0,1])).toBeTruthy();
});


cardList('Verificar que se pueda asignar una fecha a una tarjeta', async ({ testCard }) => {
    const startDate = faker.date.future(0.1); // dentro de ~1 mes
    const endDate = faker.date.future(0.2, startDate); // dentro de 2 meses después del inicio
    const expectedStartDate = startDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
    const expectedEndDate = endDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });

    const startDateISO = startDate.toISOString().split('T')[0];
    const endDateISO = endDate.toISOString().split('T')[0];
    await testCard.selectDueDate(startDateISO, endDateISO,1500);
    expect(await testCard.isDueDateSet(expectedStartDate, expectedEndDate)).toBe(true);
});

cardList('Verificar que se pueda asignar miembros a una tarjeta', async ({ testCard }) => {
    const members = ['sansisoft'];
    await testCard.addMembers(members, 1500);
    expect(await testCard.areMembersAdded(members)).toBe(true);
});