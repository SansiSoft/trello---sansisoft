import { ROUTES } from "../utils/routes";

class LoginPage {

    constructor(page) {
        this.page = page; 
        
        this.emailInput = 'input#username-uid1';
        this.continueBtn = 'button[data-testid="login-submit-idf-testid"]'  
        this.passwordInput= 'input#password'; 
    }

    async goto() {
        await this.page.goto(ROUTES.LOGIN);
    }

    async login(email, password) {
        await this.page.fill(this.emailInput, email);
        await this.page.click(this.continueBtn);
        await this.page.fill(this.passwordInput, password);
        await this.page.click(this.continueBtn);
    }

    async goToTrelloApp() {
        await this.page.locator('a:has-text("Trello")').first().click();
    }
}


module.exports = { LoginPage };

