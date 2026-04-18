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
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(userData) })
    );
    // ✅ refresh возвращает новый токен — interceptor НЕ делает window.location.href
    await context.route(`${BACKEND}/api/auth/refresh`, route =>
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ access_token: 'mock-token', refresh_token: 'mock-refresh' }),
        })
    );
    await context.route(`${BACKEND}/api/auth/login`, route =>
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ access_token: 'mock-token', refresh_token: 'mock-refresh' }),
        })
    );
    await context.route(`${BACKEND}/api/auth/logout`, route =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
    );
    await context.route(`${BACKEND}/api/pdf/list`, route =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) })
    );
    await context.route(`${BACKEND}/api/pdf/upload`, route =>
        route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ detail: 'Only PDF files allowed' }) })
    );
    await context.route(`${BACKEND}/api/pdf/999`, route =>
        route.fulfill({ status: 403, contentType: 'application/json', body: JSON.stringify({ detail: 'Forbidden' }) })
    );

    // ✅ addInitScript только один раз — убран дубль из userPage
    await context.addInitScript(() => {
        localStorage.setItem('access_token', 'mock-token');
        localStorage.setItem('refresh_token', 'mock-refresh');
    });
}

async function setupPage(context: BrowserContext, userData: object): Promise<Page> {
    await mockAuthRoutes(context, userData);
    const page = await context.newPage();
    await page.goto(`${FRONTEND}/app`);
    await page.waitForURL(/\/app$/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    return page;
}

export const test = base.extend<Fixtures>({
    userPage: async ({ browser }, use) => {
        const context = await browser.newContext();
        const page = await setupPage(context, { user_id: 1, email: USER_CREDENTIALS.email, role: 'user' });
        await use(page);
        await context.close();
    },

    adminPage: async ({ browser }, use) => {
        const context = await browser.newContext();
        const page = await setupPage(context, { user_id: 2, email: ADMIN_CREDENTIALS.email, role: 'admin' });
        await use(page);
        await context.close();
    },

    authUser: async ({ browser }, use) => {
        const context = await browser.newContext();
        const page = await setupPage(context, { user_id: 1, email: 'user@example.com', role: 'user' });
        await use(page);
        await context.close();
    },

    authAdmin: async ({ browser }, use) => {
        const context = await browser.newContext();
        const page = await setupPage(context, { user_id: 2, email: 'admin@example.com', role: 'admin' });
        await use(page);
        await context.close();
    },
});

export { expect };