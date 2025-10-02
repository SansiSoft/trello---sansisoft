export async function clickButton(locator) {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
}

export async function forceClick(locator) {
    await locator.click({ force: true });
}

export async function fillInput(locator, text) {
    // await locator.waitFor({ state: 'attached' });
    // await locator.waitFor({ state: 'visible' });
    await locator.fill(text);
}
