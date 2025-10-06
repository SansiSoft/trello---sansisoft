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
        this.membersModal = page.locator('button[data-testid="card-back-members-button"]');
        this.addMemberSearchInput = page.locator('input[aria-placeholder="Search members"]');

        //section dates
        this.dueDateModal = page.locator('button[data-testid="card-back-due-date-button"]');
        this.modalDueDate = page.locator('section[aria-labelledby="card-back-add-dates"]');
        this.startDateBtn = page.locator('label[data-testid="clickable-checkbox"]');
        this.saveDateBtn = page.locator('button[data-testid="save-date-button"]');

        //section checklists
        this.checkListButton = page.locator('span[data-testid="ChecklistIcon"]');

        //section attachments
        this.attachmentButton = page.locator('button[data-testid="card-back-attachment-button"]');

        //section de descripción
        this.descriptionField = page.locator('button[data-testid="description-button"]');

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

    async selectDueDate(startDate = "", endDate = "", stepDelay = 1500) {
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
        console.log('Rango de fechas actual en UI:', actualText);
        console.log('rango de fechas actual two', `${expectedStartDate} - ${expectedEndDate}`);

        return actualText.startsWith(`${expectedStartDate} - ${expectedEndDate}`);
    }

    async addMembers(members = [], stepDelay = 1500) {
        try {
            this.addButton.click();
            console.log('Step 1: Abriendo modal de miembros...');
            await this.membersModal.click();
            await this.page.waitForTimeout(stepDelay);
            // Espera a que aparezca la lista de miembros
            const modalMembers = this.page.locator('section[aria-labelledby="card-back-add-members"]');
            await expect(modalMembers).toBeVisible({timeout: 10000});
            await this.page.waitForTimeout(stepDelay);
            const searchInput = this.page.locator('input[aria-placeholder="Search members"]');
            await expect(searchInput).toBeVisible({timeout: 10000});
            // Espera a que haya al menos un miembro renderizado
            const memberItem = modalMembers.locator('button[data-testid="choose-member-item-add-member-button"]');
            await expect(memberItem.first()).toBeVisible({timeout: 10000});
            console.log('Modal abierto y miembros cargados');

            if (!Array.isArray(members)) {
                members = [members];
            }

            for (const member of members) {
                try {
                    console.log(`Step: Buscando miembro "${member}"...`);

                    await this.addMemberSearchInput.clear();
                    await this.addMemberSearchInput.fill(member);
                    const results = this.page.locator('button[data-testid="choose-member-item-add-member-button"]');
                    //Buscar coincidencia con el texto ingresado (insensible a mayúsculas/minúsculas)
                    let itemToSelect = results.filter({hasText: new RegExp(member, 'i')}).first();

                    //Fallback: si no hay coincidencia, seleccionar el primer resultado
                    if (!(await itemToSelect.isVisible())) {
                        console.log(`No se encontró coincidencia exacta para "${member}", seleccionando el primero...`);
                        itemToSelect = results.first();
                    }

                    await itemToSelect.click();
                    console.log(`Miembro "${member}" seleccionado correctamente`);
                    await this.page.waitForTimeout(stepDelay);
                } catch (error) {
                    console.error(`Error al seleccionar miembro "${member}":`, error);
                }
            }
            console.log('Cerrando modal...');
            await this.closeBtn.click();

        } catch (error) {
            console.error('Error seleccionando miembros:', error);
            await this.page.screenshot({path: `error-members-${Date.now()}.png`});
            throw error;
        }
    }

    async areMembersAdded(members = []) {
        if (!Array.isArray(members)) {
            members = [members];
        }
        for (const member of members) {
            const memberLocator = this.page.locator(
                `section:has(h3:has-text("Members")) button[data-testid="card-back-member-avatar"] span[aria-label*="${member}"]`
            );
            if (!(await memberLocator.isVisible())) {
                return false;
            }
        }
        return true;
    }

    async addCheckList(titlesChecklist = "Default Checklist", stepDelay = 1500) {
        await this.checkListButton.click();
        await this.page.waitForTimeout(stepDelay);
        const modalChecklist = this.page.locator('section[aria-labelledby="add-checklist-popover"]');
        await expect(modalChecklist).toBeVisible({timeout: stepDelay});
        const inputChecklist = this.page.locator('input[id="id-checklist"]');
        await expect(inputChecklist).toBeVisible({timeout: stepDelay});
        await inputChecklist.fill(titlesChecklist);
        await this.page.waitForTimeout(stepDelay);
        const addButton = this.page.locator('button[data-testid="checklist-add-button"]');
        await addButton.click();
        await this.page.waitForTimeout(stepDelay);
        console.log(`Creando checklist "${titlesChecklist}"...`);

    }

    async validateCheckListVisible(checklistTitle) {
        const checklistSection = this.page.locator(`section[data-testid="checklist-section"]`);
        await expect(checklistSection.filter({hasText: checklistTitle}).first()).toBeVisible();
        console.log(`Checklist "${checklistTitle}" visible en la tarjeta`);
    }

    async deleteCheckList(title, stepDelay = 1500) {
        console.log(`Eliminando checklist "${title}"...`);

        // Localiza el checklist por título
        const checklistSection = this.page.locator('section[data-testid="checklist-section"]')
            .filter({hasText: title})
            .first();

        await expect(checklistSection).toBeVisible();

        // Botón "Delete" dentro del checklist
        const deleteButton = checklistSection.locator('button[data-testid="checklist-delete-button"]');
        await deleteButton.click();
        await this.page.waitForTimeout(stepDelay);

        // Botón de confirmación (por texto)
        const confirmDeleteBtn = this.page.getByRole('button', {name: 'Delete checklist'});
        await expect(confirmDeleteBtn).toBeVisible();
        await confirmDeleteBtn.click();

        console.log(`Checklist "${title}" eliminado correctamente`);
    }

    async isCheckListDeleted(title) {
        const checklistSection = this.page
            .locator('section[data-testid="checklist-section"]')
            .filter({hasText: title});

        // Devuelve true si el count es 0
        const count = await checklistSection.count();
        return count === 0;
    }

    async addAttachment(filePath, stepDelay = 1500) {
        try {
            console.log('Step 1: Abriendo modal de adjuntos...');
            await this.addButton.click();
            await this.attachmentButton.click();
            await this.page.waitForTimeout(stepDelay);

            // Espera a que aparezca el modal de attachments
            const modalAttachment = this.page.locator('section[aria-labelledby="card-back-add-attachment"]');
            await expect(modalAttachment).toBeVisible({timeout: 10000});
            await this.page.waitForTimeout(stepDelay);

            // Seleccionar la opción de subir archivo
            const fileInput = this.page.locator('input[type="file"][id="card-attachment-file-picker"], input[type="file"][name="card-attachment-file-picker"]');

            if (await fileInput.count() > 0) {
                await fileInput.setInputFiles(filePath);
                console.log(`Archivo "${filePath}" subido`);
            }
            // Esperar a que se procese la subida
            await this.page.waitForTimeout(stepDelay * 2);
            await this.page.waitForTimeout(stepDelay);

            console.log(`Attachment agregado: ${filePath}`);
        } catch (error) {
            console.error('Error al adjuntar archivo:', error);
            await this.page.screenshot({path: `error-attach-${Date.now()}.png`});
            throw error;
        }
    }

    async isAttachmentVisible(fileName) {
        const attachmentLocator = this.page.locator(
            `span[data-testid="attachment-thumbnail-name"]`,
        ).filter({hasText: fileName});

        const count = await attachmentLocator.count();
        console.log(`🔍 Se encontraron ${count} coincidencias para "${fileName}"`);

        const isVisible = count > 0 && await attachmentLocator.first().isVisible();
        console.log(`📎 Attachment "${fileName}" visible:`, isVisible);
        return isVisible;
    }

    async removeAttachment(fileName, stepDelay = 1500) {

        try {
            console.log(`Iniciando eliminación del attachment: "${fileName}"`);
            //Primero verificar que el attachment existe
            const attachmentExists = await this.verifyAttachmentExists(fileName);
            if (!attachmentExists) {
                console.log(`Attachment "${fileName}" no encontrado. No se puede eliminar.`);
                return false;
            }

            console.log(`Attachment "${fileName}" encontrado, procediendo a eliminar...`);

            //Buscar el attachment específico y hacer hover para mostrar opciones
            const attachmentItem = this.page.locator(`[data-testid*="attachment"]:has-text("${fileName}")`).first();
            await attachmentItem.hover();
            await this.page.waitForTimeout(500);

            //Hacer clic en el botón de opciones
            const optionsButton = this.page.locator('button[data-testid="link-attachment-actions"]').first();
            await optionsButton.click();
            await this.page.waitForTimeout(stepDelay);

            //Verificar y hacer clic en el botón de eliminar
            const removeButtonOption = this.page.locator('button[data-testid="delete-link-attachment"]');
            await expect(removeButtonOption).toBeVisible({timeout: 5000});
            await removeButtonOption.click();
            await this.page.waitForTimeout(stepDelay);

            //Confirmar eliminación
            const confirmDeleteBtn = this.page.locator('button[data-testid="confirm-delete-link-attachment"]');
            await expect(confirmDeleteBtn).toBeVisible({timeout: 5000});
            await confirmDeleteBtn.click();

            //Esperar a que se complete la eliminación
            await this.page.waitForTimeout(stepDelay);
        } catch (error) {
            console.error(`Error eliminando attachment "${fileName}":`, error);
            return false;
        }
    }

    async verifyAttachmentExists(fileName) {
        try {
            const attachmentSelectors = [
                `[data-testid*="attachment"]:has-text("${fileName}")`,
                `.attachment-item:has-text("${fileName}")`,
                `text="${fileName}"`
            ];

            for (const selector of attachmentSelectors) {
                const element = this.page.locator(selector).first();
                if (await element.count() > 0 && await element.isVisible()) {
                    console.log(`Attachment "${fileName}" encontrado con selector: ${selector}`);
                    return true;
                }
            }

            console.log(`Attachment "${fileName}" no encontrado`);
            return false;

        } catch (error) {
            console.error('Error en verifyAttachmentExists:', error);
            return false;
        }
    }

    async isAttachmentDeleted(fileName) {
        try {
            // Buscar el attachment por nombre
            const attachmentItem = this.page
                .locator('data-testid="attachment-thumbnail-name"')
                .filter({hasText: fileName});

            // También buscar por cualquier elemento que contenga el nombre del archivo
            const anyAttachmentWithName = this.page
                .locator(`text=${fileName}`)
                .filter({has: this.page.locator('[data-testid="attachment-thumbnail-name"]')});

            // Verificar que ambos selectores devuelven count 0
            const count1 = await attachmentItem.count();
            const count2 = await anyAttachmentWithName.count();

            console.log(`Attachment "${fileName}" - Count1: ${count1}, Count2: ${count2}`);

            return count1 === 0 && count2 === 0;

        } catch (error) {
            console.error('Error en isAttachmentDeleted:', error);
            return false;
        }
    }

    async addDescription(descriptionText, stepDelay = 1500) {
        console.log('Step 1: Abriendo editor de descripción...');

        const descriptionEditor = this.page.locator('button[data-testid="description-button"]');
        const saveDescriptionBtn = this.page.locator('button[data-testid="description-save-button"]');
        const textArea = this.page.locator('div[role="textbox"][contenteditable="true"][aria-label="Description"]');
        // Esperar a que el editor esté visible y hacer click
        await descriptionEditor.click();

        console.log('Step 2: Ingresando descripción...');
        // Limpiar el campo y escribir el texto
        await textArea.fill(descriptionText);

        console.log('Step 3: Guardando descripción...');
        await saveDescriptionBtn.waitFor({ state: 'visible' });
        await saveDescriptionBtn.click();

        // Esperar un poco para asegurar que se guarde
        await this.page.waitForTimeout(stepDelay);
        console.log('Descripción agregada correctamente.');
    }

    async editDescription(newDescriptionText, stepDelay = 1500) {
        const editButton = this.page.locator('button[data-testid="description-edit-button"]');
        const saveDescriptionBtn = this.page.locator('button[data-testid="description-save-button"]');
        await editButton.click();
        await this.page.waitForTimeout(stepDelay);
        const textArea = this.page.locator('div[role="textbox"][contenteditable="true"][aria-label="Description"]');
        await textArea.fill(newDescriptionText);
        await saveDescriptionBtn.click();
    }

    async verifyDescription(expectedText) {
        const descriptionContent = this.page.locator('div[data-testid="description-content-area"]');
        await expect(descriptionContent).toHaveText(expectedText, { timeout: 5000 });
        console.log('Verificación exitosa: la descripción coincide con el texto esperado.');

    }
}

module.exports = {CardPage};
