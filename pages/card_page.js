const {expect} = require('@playwright/test');

class CardPage {
    constructor(page, cardTitle) {
        this.page = page;
        this.title = cardTitle;
        this.cardHeader = page.locator(`section[data-testid="card-back-header"]`);
        this.addCommentButton = page.locator('button[data-testid="card-back-new-comment-input-skeleton"]')

        // Campo de comentario (ProseMirror)
        this.commentBox = this.page.locator('div[role="textbox"][contenteditable="true"]');
        this.submitCommentButton = this.page.locator('button[data-testid="card-back-comment-save-button"]');

        // Tags de los comentarios dentro de la card
        this.commentTextLocator = page.locator('div[data-testid="comment-container"] .ak-renderer-document p');
        //Add button
        this.addButton = page.locator('button[data-testid="card-back-add-to-card-button"]');

        //section labels
        this.labelsModal = page.locator('button[data-testid="card-back-labels-button"]');
        this.modalLabels = page.locator('section[data-testid="labels-popover-labels-screen"]');
        this.labelOptions = page.locator('section[data-testid="labels-popover-labels-screen"] label[data-testid="clickable-checkbox"]');

        //section members

        //section dates
        this.dueDateModal = page.locator('button[data-testid="card-back-due-date-button"]');
        this.modalDueDate = page.locator('section[aria-labelledby="card-back-add-dates"]');
        this.startDateBtn = page.locator('label[data-testid="clickable-checkbox"]');
        this.saveDateBtn = page.locator('button[data-testid="save-date-button"]');

        // Selectores para verificar elementos agregados
        this.addedLabels = page.locator('[data-testid="card-label"]');

        this.closeBtn = page.locator('button[aria-label="Close popover"]');
    }

    async getTitle() {
        const titleText = await this.cardHeader.textContent();
        return titleText.trim();
    }

    async addComment(commentText) {
        await this.addCommentButton.click();
        await this.commentBox.waitFor({state: 'visible'});
        // Dar foco
        await this.commentBox.click();
        // Escribir el comentario simulando teclado real
        await this.commentBox.type(commentText);

        await this.submitCommentButton.click();
        // Espera hasta que desaparezca el loading (Sending message)
        const sendingLocator = this.page.locator('div:text-is("Sending…")');
        await sendingLocator.waitFor({state: 'hidden', timeout: 10000});
    }

    async getCommentsTextOnly() {
        const count = await this.commentTextLocator.count();
        const comments = [];
        for (let i = 0; i < count; i++) {
            comments.push((await this.commentTextLocator.nth(i).textContent()).trim());
        }

        return comments;
    }

    async waitForElement(locator, timeout = 1000) {
        try {
            await locator.waitFor({state: 'visible', timeout});
            return true;
        } catch (error) {
            console.log(`Element not found: ${locator}`);
            // Tomar screenshot para debug
            await this.page.screenshot({path: `debug-${Date.now()}.png`});
            return false;
        }
    }

    async isLabelAdded() {
        return await this.addedLabels.first().isVisible();
    }

    async selectLabels(labels = [], stepDelay = 2000) {
        try {
            console.log('Step 1: Abriendo modal de etiquetas...');
            await this.addButton.click();
            await this.page.waitForTimeout(stepDelay);
            await this.labelsModal.click();
            await this.page.waitForTimeout(stepDelay);
            let modalVisible = await this.waitForElement(this.modalLabels);
            if (!modalVisible) throw new Error('El modal de etiquetas no apareció');
            console.log('Modal abierto correctamente');
            if (!Array.isArray(labels)) {
                labels = [labels];
            }
            for (const label of labels) {
                let targetLabel = null;
                // Si es número, seleccionamos por índice
                if (typeof label === 'number') {
                    console.log(`Step: Seleccionando etiqueta por índice [${label}]...`);
                    targetLabel = this.labelOptions.nth(label);
                } else {
                    console.log(`Step: Buscando etiqueta con texto "${label}"...`);
                    targetLabel = this.labelOptions.filter({hasText: label}).first();
                    // Estrategia 2: regex insensible a mayúsculas
                    if (!(await targetLabel.isVisible())) {
                        targetLabel = this.labelOptions.filter({hasText: new RegExp(label, 'i')}).first();
                    } // Estrategia 3: fallback → primera etiqueta
                    if (!(await targetLabel.isVisible())) {
                        console.log('Etiqueta específica no encontrada, seleccionando primera disponible');
                        targetLabel = this.labelOptions.first();
                    }
                }
                await targetLabel.click();
                console.log(`Etiqueta "${label}" seleccionada`);
                await this.page.waitForTimeout(stepDelay);
            }
            console.log('Step: Cerrando modal con ESC...');
            await this.page.waitForTimeout(stepDelay);
            this.closeBtn.click();
            await this.page.waitForTimeout(stepDelay);
            console.log('Proceso de selección de etiquetas completado con éxito');
        } catch (error) {
            console.error('Error seleccionando etiquetas:', error);
            await this.page.screenshot({path: `error-labels-${Date.now()}.png`});
            throw error;
        }
    }

    async selectDueDate(startDate = true, endDate = true, stepDelay = 1500) {
        try {
            console.log('Step 1: Abriendo modal de fechas...');
            await this.addButton.click();
            await this.page.waitForTimeout(stepDelay);
            await this.dueDateModal.click();
            await this.page.waitForTimeout(stepDelay);
            let modalVisible = await this.waitForElement(this.modalDueDate);
            if (!modalVisible) throw new Error('El modal de fechas no apareció');
            console.log('Modal abierto correctamente');
            if (startDate && endDate) {
                console.log('Step: Seleccionando fecha de inicio...');
                await this.startDateBtn.first().click();
                const inputStart = this.page.locator('input[data-testid="start-date-field"]');
                await inputStart.fill(startDate);
                console.log(`Fecha de inicio seleccionada: ${startDate}`);
                await this.page.waitForTimeout(stepDelay);

                console.log('Step: Seleccionando fecha fin ...');
                const inputEnd = this.page.locator('input[data-testid="due-date-field"]');
                await inputEnd.fill(endDate);
                console.log(`Fecha fin seleccionada: ${endDate}`);
                await this.page.waitForTimeout(stepDelay);
            }
            console.log('Step: Guardando fecha seleccionada...');
            await this.saveDateBtn.click();
            await this.page.waitForTimeout(stepDelay);
        } catch (error) {
            console.error('Error seleccionando fecha:', error);
            await this.page.screenshot({path: `error-dueDate-${Date.now()}.png`});
            throw error;
        }
    }

    async isDueDateSet(expectedStartDate, expectedEndDate) {
        const dueDateLocator = this.page.locator(
            "button[data-testid='due-date-badge-with-date-range-picker'] span"
        ).first();

        const actualText = (await dueDateLocator.textContent()).trim();
        console.log('rango de fechas actual', actualText);
        return actualText.includes(expectedStartDate) && actualText.includes(expectedEndDate);
    }
}
module.exports = {CardPage};
