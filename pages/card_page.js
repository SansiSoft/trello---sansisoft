const { expect } = require('@playwright/test');

class CardPage {
  constructor(page, cardTitle) {
    this.page = page;

    this.cardHeader = page.locator(
      `section[data-testid="card-back-header"]`
    );

    this.addCommentButton = page.locator(
      'button[data-testid="card-back-new-comment-input-skeleton"]'
    )

    // Campo de comentario (ProseMirror)
    this.commentBox = this.page.locator('div[role="textbox"][contenteditable="true"]');
    this.submitCommentButton = this.page.locator('button[data-testid="card-back-comment-save-button"]');

    // Tags de los comentarios dentro de la card
    this.commentTextLocator = page.locator(
      'div[data-testid="comment-container"] .ak-renderer-document p'
    );
  }

  async getTitle() {
    const titleText = await this.cardHeader.textContent();
    return titleText.trim();
  }

  async addComment(commentText) {
    await this.addCommentButton.click();
    await this.commentBox.waitFor({ state: 'visible' });
    // Dar foco
    await this.commentBox.click();
    // Escribir el comentario simulando teclado real
    await this.commentBox.type(commentText);

    await this.submitCommentButton.click();
    // Espera hasta que desaparezca el loading (Sending message)
    const sendingLocator = this.page.locator('div:text-is("Sending…")');
    await sendingLocator.waitFor({ state: 'hidden', timeout: 10000 });
  }

  async getCommentsTextOnly() {
    const count = await this.commentTextLocator.count();
    const comments = [];
    for (let i = 0; i < count; i++) {
      comments.push((await this.commentTextLocator.nth(i).textContent()).trim());
    }
    
    return comments;
  }
}

module.exports = { CardPage };
