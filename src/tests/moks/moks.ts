// tests/moks.ts
import { test as base, Page, expect } from '@playwright/test';

// Типы фикстур
type CustomFixtures = {
    loginAsUser: Page;
    loginAsAdmin: Page;
    mockPdfApi: Page;
    mockDictionaryApi: Page;
};

// Расширяем базовый test
export const test = base.extend<CustomFixtures>({
    // Фикстура: пользователь
    loginAsUser: async ({ page }, use) => {
        await page.route('**/api/auth/login', route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ email: 'user@example.com', role: 'user', token: 'token' }),
            })
        );
        await use(page);
    },

    // Фикстура: админ
    loginAsAdmin: async ({ page }, use) => {
        await page.route('**/api/auth/login', route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ email: 'admin@example.com', role: 'admin', token: 'token' }),
            })
        );
        await use(page);
    },

    // Фикстура: PDF API
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

    // Фикстура: Dictionary API
    mockDictionaryApi: async ({ page }, use) => {
        await page.route('**/api/dictionary', route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ cards: [{ id: 1, question: 'Q', answer: 'A' }], total: 1 }),
            })
        );
        await use(page);
    },
});

// Экспортируем expect
export { expect };