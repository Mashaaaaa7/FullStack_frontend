import { test as base, expect, Page } from '@playwright/test';

export const BACKEND = 'http://127.0.0.1:8000';
export const FRONTEND = 'http://localhost:3000';

export const USER_CREDENTIALS = { email: 'mashavacylieva@gmail.com', password: 'Mary2004' };
export const ADMIN_CREDENTIALS = { email: 'mary200438@gmail.com', password: 'Mary2004' };

type Fixtures = {
    userPage: Page;
    adminPage: Page;
};

async function loginViaUI(page: Page, email: string, password: string) {
    await page.goto(`${FRONTEND}/login`);
    await page.fill('input[placeholder="Email"]', email);
    await page.fill('input[placeholder="Пароль"]', password);
    await page.click('button:has-text("Войти")');
    await expect(page).toHaveURL(/\/app$/, { timeout: 10000 });
}

export const test = base.extend<Fixtures>({
    userPage: async ({ browser }, use) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        await loginViaUI(page, USER_CREDENTIALS.email, USER_CREDENTIALS.password);
        await use(page);
        await context.close();
    },

    adminPage: async ({ browser }, use) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        await loginViaUI(page, ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
        await use(page);
        await context.close();
    },
});

export { expect };