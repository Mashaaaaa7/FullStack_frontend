import { test as base, expect, Page, BrowserContext } from '@playwright/test';

const BACKEND = 'http://127.0.0.1:8000';
const FRONTEND = 'http://localhost:3000';

type CustomFixtures = {
    authUser: Page;
    authAdmin: Page;
    mockPdfApi: void;
    mockDictionaryApi: void;
};

async function mockAuthRoutes(context: BrowserContext, userData: object) {
    await context.route(`${BACKEND}/api/profile/me`, route =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(userData) })
    );
    await context.route(`${BACKEND}/api/auth/refresh`, route =>
        route.fulfill({
            status: 200, contentType: 'application/json',
            body: JSON.stringify({ access_token: 'dummy', refresh_token: 'dummy' }),
        })
    );
    await context.route(`${BACKEND}/api/auth/login`, route =>
        route.fulfill({
            status: 200, contentType: 'application/json',
            body: JSON.stringify({ access_token: 'dummy', refresh_token: 'dummy' }),
        })
    );
    await context.addInitScript(() => {
        localStorage.setItem('access_token', 'mock-token');
    });
}

export const test = base.extend<CustomFixtures>({
    authUser: async ({ browser }, use) => {
        const context = await browser.newContext();
        await mockAuthRoutes(context, { user_id: 1, email: 'user@example.com', role: 'user' });
        const page = await context.newPage();
        await page.goto(`${FRONTEND}/app`);
        await use(page);
        await context.close();
    },

    authAdmin: async ({ browser }, use) => {
        const context = await browser.newContext();
        await mockAuthRoutes(context, { user_id: 2, email: 'admin@example.com', role: 'admin' });
        const page = await context.newPage();
        await page.goto(`${FRONTEND}/app`);
        await use(page);
        await context.close();
    },

    mockPdfApi: async ({ page }, use) => {
        await page.route(`${BACKEND}/api/pdf/list*`, route =>
            route.fulfill({
                status: 200, contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    items: [{ id: 1, file_name: 'test.pdf', status: 'done', size: 1024, created_at: new Date().toISOString() }],
                    total: 1,
                }),
            })
        );
        await page.route(`${BACKEND}/api/pdf/cards/*`, route =>
            route.fulfill({
                status: 200, contentType: 'application/json',
                body: JSON.stringify({ cards: [{ id: 1, question: 'Q', answer: 'A' }], total: 1 }),
            })
        );
        await use();
    },

    mockDictionaryApi: async ({ page }, use) => {
        await page.route('**/api/dictionary*', route =>
            route.fulfill({
                status: 200, contentType: 'application/json',
                body: JSON.stringify({
                    word: 'apple',
                    definitions: [{ partOfSpeech: 'noun', definition: 'яблоко', example: 'I eat an apple.' }],
                }),
            })
        );
        await use();
    },
});

export { expect };