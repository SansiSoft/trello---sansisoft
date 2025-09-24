const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/login_page');
const access = require('../../data/credentials.json');

const casos = [
    {
        testCaseName: 'Case 1: Inicio de sesion exitoso con credenciales validas',
        credentialsList: access.valid,
        expectedTitle: 'Atlassian Home' // 'Tableros | Trello' //TODO: Pending to check
    }
];

casos.forEach(({ testCaseName, credentialsList, expectedTitle }) => {
    test.describe(testCaseName, () => {
        for (var i = 0; i < credentialsList.length; i++) {
            const credenciales = credentialsList[i];

            test(`TC: Login with email "${credenciales.email}"`, async ({ page }) => {
                const login_page = new LoginPage(page);
                await login_page.goto();
                await login_page.login(credenciales.email, credenciales.password);
                await login_page.goToTrelloApp();
                await expect(page).toHaveTitle(expectedTitle);
            });
        }
    });
});

