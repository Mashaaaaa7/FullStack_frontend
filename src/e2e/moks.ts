import { test as base, Page } from '@playwright/test';

// Определяем интерфейс для наших кастомных фикстур
type CustomFixtures = {
    loginAsUser: Page;
    loginAsAdmin: Page;
    mockPdfApi: Page;
};

// Расширяем base тест на свои фикстуры
export const test = base.extend<CustomFixtures>({
    loginAsUser: async ({ page }, use) => {
        await page.route('**/api/auth/login', route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ email: 'mashavacylieva@gmail.com', role: 'user' }),
            })
        );
        await use(page);
    },

    loginAsAdmin: async ({ page }, use) => {
        await page.route('**/api/auth/login', route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ email: 'mary200438@gmail.com', role: 'admin' }),
            })
        );
        await use(page);
    },

    mockPdfApi: async ({ page }, use) => {
        await page.route('**/api/pdf/**', route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ cards: [{ id: 1, question: 'Q', answer: 'A' }], total: 1 }),
            })
        );
        await use(page);
    },
});

export { expect } from '@playwright/test';