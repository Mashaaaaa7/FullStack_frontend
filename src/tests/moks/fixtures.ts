import { test as base, expect, Page, BrowserContext } from '@playwright/test';

export const BACKEND = 'http://127.0.0.1:8000';
export const FRONTEND = 'http://localhost:3000';

export const USER_CREDENTIALS = { email: 'mashavacylieva@gmail.com', password: 'Mary2004' };
export const ADMIN_CREDENTIALS = { email: 'mary200438@gmail.com', password: 'Mary2004' };

type Fixtures = {
    userPage: Page;
    adminPage: Page;
    authUser: Page;
    authAdmin: Page;
};

async function mockAuthRoutes(context: BrowserContext, userData: object) {
    await context.route(`${BACKEND}/api/profile/me`, route =>
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(userData),
        })
    );
    await context.route(`${BACKEND}/api/auth/refresh`, route =>
        route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ detail: 'No refresh token' }),
        })
    );
    await context.route(`${BACKEND}/api/auth/login`, route =>
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ access_token: 'dummy', refresh_token: 'dummy' }),
        })
    );

    await context.route(`${BACKEND}/api/auth/logout`, route =>
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true }),
        })
    );

    await context.addInitScript(() => {
        localStorage.setItem('access_token', 'mock-token');
    });

    await context.route(`${BACKEND}/api/pdf/list`, route =>
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ items: [], total: 0 }),
        })
    );

    await context.route(`${BACKEND}/api/pdf/upload`, route =>
        route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({ detail: 'Only PDF files allowed' }),
        })
    );

    await context.route(`${BACKEND}/api/pdf/999`, route =>
        route.fulfill({
            status: 403,
            contentType: 'application/json',
            body: JSON.stringify({ detail: 'Forbidden' }),
        })
    );
}

export const test = base.extend<Fixtures>({
    userPage: async ({ browser }, use) => {
        const context = await browser.newContext();
        await mockAuthRoutes(context, { user_id: 1, email: USER_CREDENTIALS.email, role: 'user' });
        const page = await context.newPage();
        await page.goto(`${FRONTEND}/app`);
        await use(page);
        await context.close();
    },

    adminPage: async ({ browser }, use) => {
        const context = await browser.newContext();
        await mockAuthRoutes(context, { user_id: 2, email: ADMIN_CREDENTIALS.email, role: 'admin' });
        const page = await context.newPage();
        await page.goto(`${FRONTEND}/app`);
        await use(page);
        await context.close();
    },

    authUser: async ({ browser }, use) => {
        const context = await browser.newContext();
        await mockAuthRoutes(context, { user_id: 1, email: 'user@example.com', role: 'user' });
        const page = await context.newPage();
        await page.goto(`${FRONTEND}/app`);
        await page.waitForURL(/\/app$/, { timeout: 10000 });
        await use(page);
        await context.close();
    },

    authAdmin: async ({ browser }, use) => {
        const context = await browser.newContext();
        await mockAuthRoutes(context, { user_id: 2, email: 'admin@example.com', role: 'admin' });
        const page = await context.newPage();
        await page.goto(`${FRONTEND}/app`);
        await page.waitForURL(/\/app$/, { timeout: 10000 });
        await use(page);
        await context.close();
    },
});

export { expect };