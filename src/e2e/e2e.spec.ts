import { test as base, expect, Page } from '@playwright/test';

type CustomFixtures = {
    authUser: Page;
    authAdmin: Page;
};

const BACKEND = 'http://127.0.0.1:8000';

// Создаём JWT прямо в браузере через page.evaluate, чтобы jwtDecode точно его принял
async function injectAuth(page: Page, userData: { user_id: number; email: string; role: string }) {
    // Сначала идём на любую страницу чтобы инициализировать браузерный контекст
    await page.goto('http://localhost:3000/');

    await page.evaluate((user) => {
        const encode = (obj: object) =>
            btoa(JSON.stringify(obj))
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=/g, '');
        const header = encode({ alg: 'HS256', typ: 'JWT' });
        const body = encode({ sub: String(user.user_id), role: user.role, exp: 9999999999 });
        localStorage.setItem('access_token', `${header}.${body}.fake_signature`);
    }, userData);
}

export const test = base.extend<CustomFixtures>({
    authUser: async ({ page }, use) => {
        const userData = { user_id: 1, email: 'user@example.com', role: 'user' };

        await page.route(`${BACKEND}/api/profile/me`, route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(userData),
            })
        );
        await page.route(`${BACKEND}/api/auth/refresh`, route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ access_token: 'dummy', refresh_token: 'dummy' }),
            })
        );
        await page.route(`${BACKEND}/api/auth/login`, route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ access_token: 'dummy', refresh_token: 'dummy' }),
            })
        );

        await injectAuth(page, userData);
        await use(page);
    },

    authAdmin: async ({ page }, use) => {
        const userData = { user_id: 2, email: 'admin@example.com', role: 'admin' };

        await page.route(`${BACKEND}/api/profile/me`, route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(userData),
            })
        );
        await page.route(`${BACKEND}/api/auth/refresh`, route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ access_token: 'dummy', refresh_token: 'dummy' }),
            })
        );
        await page.route(`${BACKEND}/api/auth/login`, route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ access_token: 'dummy', refresh_token: 'dummy' }),
            })
        );

        await injectAuth(page, userData);
        await use(page);
    },
});

async function setupMockApi(page: Page) {
    // PDF список — нужен чтобы dashboard знал какой file_id запрашивать
    await page.route(`${BACKEND}/api/pdf/list*`, route =>
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                success: true,
                items: [{ id: 1, file_name: 'test.pdf', status: 'done', size: 1024, created_at: new Date().toISOString() }],
                total: 1,
            }),
        })
    );
    // PDF карточки
    await page.route(`${BACKEND}/api/pdf/cards/*`, route =>
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ cards: [{ id: 1, question: 'Q', answer: 'A' }], total: 1 }),
        })
    );
    // Dictionary — * вместо ** чтобы матчить ?word=apple
    await page.route(`${BACKEND}/api/dictionary*`, route =>
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                word: 'apple',
                definitions: [{ partOfSpeech: 'noun', definition: 'яблоко', example: 'I eat an apple.' }],
            }),
        })
    );
}

// Для тестов логина — через UI
async function loginViaUI(page: Page, email: string) {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[placeholder="Email"]', email);
    await page.fill('input[placeholder="Пароль"]', 'password');
    await page.click('button:has-text("Войти")');
    await expect(page).toHaveURL(/\/app$/, { timeout: 10000 });
}

// -------------------- Тесты --------------------

test('user login показывает dashboard без admin меню', async ({ authUser }) => {
    await loginViaUI(authUser, 'user@example.com');
    await expect(authUser.locator('text=📖 Учебные карточки из PDF')).toBeVisible();
    await expect(authUser.locator('text=Админ-панель')).toHaveCount(0);
});

test('admin login показывает admin меню', async ({ authAdmin }) => {
    await loginViaUI(authAdmin, 'admin@example.com');
    await expect(authAdmin.locator('text=Админ-панель')).toBeVisible({ timeout: 10000 });
});

test('user может logout и сессия очищена', async ({ authUser }) => {
    await authUser.goto('http://localhost:3000/app');
    await expect(authUser).toHaveURL(/\/app$/, { timeout: 10000 });
    await authUser.click('button:has-text("Выйти")');
    await expect(authUser).toHaveURL(/\/login$/);
    const token = await authUser.evaluate(() => localStorage.getItem('access_token'));
    expect(token).toBeNull();
});

test('user просмотр PDF карточек', async ({ authUser }) => {
    await setupMockApi(authUser);
    await authUser.goto('http://localhost:3000/app');
    await expect(authUser).toHaveURL(/\/app$/, { timeout: 10000 });
    await expect(authUser.locator('text=Q')).toBeVisible();
    await expect(authUser.locator('text=A')).toBeVisible();
});

test('admin просмотр PDF карточек', async ({ authAdmin }) => {
    await setupMockApi(authAdmin);
    await authAdmin.goto('http://localhost:3000/app');
    await expect(authAdmin).toHaveURL(/\/app$/, { timeout: 10000 });
    await expect(authAdmin.locator('text=Q')).toBeVisible();
    await expect(authAdmin.locator('text=A')).toBeVisible();
});

test('user Dictionary API показывает определение', async ({ authUser }) => {
    await setupMockApi(authUser);
    await authUser.goto('http://localhost:3000/app');
    await expect(authUser).toHaveURL(/\/app$/, { timeout: 10000 });
    await authUser.fill('input[placeholder="Введите слово..."]', 'apple');
    await authUser.click('button:has-text("Узнать")');
    await expect(authUser.locator('text=яблоко')).toBeVisible();
    await expect(authUser.locator('text=Админ-панель')).toHaveCount(0);
});

test('admin Dictionary API показывает определение и админ-меню', async ({ authAdmin }) => {
    await setupMockApi(authAdmin);
    await authAdmin.goto('http://localhost:3000/app');
    await expect(authAdmin).toHaveURL(/\/app$/, { timeout: 10000 });
    await authAdmin.fill('input[placeholder="Введите слово..."]', 'apple');
    await authAdmin.click('button:has-text("Узнать")');
    await expect(authAdmin.locator('text=яблоко')).toBeVisible();
    await expect(authAdmin.locator('text=Админ-панель')).toBeVisible();
});

test('Dictionary API возвращает ошибку 401', async ({ authUser }) => {
    await authUser.route(`${BACKEND}/api/dictionary*`, route =>
        route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ detail: 'Unauthorized' }),
        })
    );
    await authUser.goto('http://localhost:3000/app');
    await expect(authUser).toHaveURL(/\/app$/, { timeout: 10000 });
    await authUser.fill('input[placeholder="Введите слово..."]', 'apple');
    await authUser.click('button:has-text("Узнать")');
    await expect(authUser.locator('text=Не удалось загрузить определение')).toBeVisible();
});

test('неавторизованный пользователь редиректится на login', async ({ page }) => {
    await page.route(`${BACKEND}/api/profile/me`, route =>
        route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ detail: 'Unauthorized' }),
        })
    );
    await page.goto('http://localhost:3000/app');
    await expect(page).toHaveURL(/\/(login)?$/);
    await expect(page.locator('text=Войти')).toBeVisible();
});