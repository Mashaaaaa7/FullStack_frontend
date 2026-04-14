import { test as base, expect, Page, BrowserContext } from '@playwright/test';

const BACKEND = 'http://127.0.0.1:8000';
const FRONTEND = 'http://localhost:3000';

type CustomFixtures = {
    authUser: Page;
    authAdmin: Page;
};

// --- Мокает авторизационные маршруты на уровне context ---
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
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ access_token: 'dummy', refresh_token: 'dummy' }),
        })
    );
    await context.route(`${BACKEND}/api/auth/login`, route =>
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ access_token: 'dummy', refresh_token: 'dummy' }),
        })
    );
    // Токен устанавливается до любой загрузки страницы
    await context.addInitScript(() => {
        localStorage.setItem('access_token', 'mock-token');
    });
}

// --- Фикстуры ---
export const test = base.extend<CustomFixtures>({
    authUser: async ({ browser }, use) => {
        const userData = { user_id: 1, email: 'user@example.com', role: 'user' };
        const context = await browser.newContext();
        await mockAuthRoutes(context, userData);
        const page = await context.newPage();
        await page.goto(`${FRONTEND}/app`);
        await use(page);
        await context.close();
    },

    authAdmin: async ({ browser }, use) => {
        const userData = { user_id: 2, email: 'admin@example.com', role: 'admin' };
        const context = await browser.newContext();
        await mockAuthRoutes(context, userData);
        const page = await context.newPage();
        await page.goto(`${FRONTEND}/app`);
        await use(page);
        await context.close();
    },
});

// --- Логин через UI ---
async function loginViaUI(page: Page, email: string) {
    await page.goto(`${FRONTEND}/login`);
    await page.fill('input[placeholder="Email"]', email);
    await page.fill('input[placeholder="Пароль"]', 'password');
    await page.click('button:has-text("Войти")');
    await expect(page).toHaveURL(/\/app$/, { timeout: 10000 });
}

// --- Мок PDF + карточки + словарь ---
async function setupMockApi(page: Page) {
    await page.route(`${BACKEND}/api/pdf/list*`, route =>
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                success: true,
                items: [{
                    id: 1,
                    file_name: 'test.pdf',
                    status: 'done',
                    size: 1024,
                    created_at: new Date().toISOString(),
                }],
                total: 1,
            }),
        })
    );

    await page.route(`${BACKEND}/api/pdf/cards/*`, route =>
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                cards: [{ id: 1, question: 'Q', answer: 'A' }],
                total: 1,
            }),
        })
    );

    // ✅ Wildcard — матчит ?word=apple на любом хосте
    await page.route('**/api/dictionary*', route =>
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                word: 'apple',
                definitions: [{
                    partOfSpeech: 'noun',
                    definition: 'яблоко',
                    example: 'I eat an apple.',
                }],
            }),
        })
    );
}

// ==================== Тесты ====================

test('user login показывает dashboard без admin меню', async ({ authUser }) => {
    await loginViaUI(authUser, 'user@example.com');
    await expect(authUser.locator('text=📖 Учебные карточки из PDF')).toBeVisible();
    await expect(authUser.locator('text=Админ')).toHaveCount(0);
});

test('admin login показывает admin меню', async ({ authAdmin }) => {
    await loginViaUI(authAdmin, 'admin@example.com');
    // ✅ text=Админ — частичное совпадение, надёжнее чем точный текст кнопки
    await expect(authAdmin.locator('text=Админ')).toBeVisible({ timeout: 10000 });
});

test('user может logout и сессия очищена', async ({ authUser }) => {
    await expect(authUser).toHaveURL(/\/app$/, { timeout: 10000 });
    await authUser.click('button:has-text("Выйти")');
    await expect(authUser).toHaveURL(/\/login$/);
    const token = await authUser.evaluate(() => localStorage.getItem('access_token'));
    expect(token).toBeNull();
});

test('user просмотр PDF карточек', async ({ authUser }) => {
    await setupMockApi(authUser);
    await authUser.goto(`${FRONTEND}/app`);
    await expect(authUser).toHaveURL(/\/app$/, { timeout: 10000 });
    await expect(authUser.locator('text=Q')).toBeVisible();
    await expect(authUser.locator('text=A')).toBeVisible();
});

test('admin просмотр PDF карточек', async ({ authAdmin }) => {
    await setupMockApi(authAdmin);
    await authAdmin.goto(`${FRONTEND}/app`);
    await expect(authAdmin).toHaveURL(/\/app$/, { timeout: 10000 });
    await expect(authAdmin.locator('text=Q')).toBeVisible();
    await expect(authAdmin.locator('text=A')).toBeVisible();
});

test('user Dictionary API показывает определение', async ({ authUser }) => {
    await setupMockApi(authUser);
    await authUser.goto(`${FRONTEND}/app`);
    await expect(authUser).toHaveURL(/\/app$/, { timeout: 10000 });
    await authUser.fill('input[placeholder="Введите слово..."]', 'apple');
    await authUser.click('button:has-text("Узнать")');
    await expect(authUser.locator('text=яблоко')).toBeVisible();
    await expect(authUser.locator('text=Админ')).toHaveCount(0);
});

test('admin Dictionary API показывает определение и админ-меню', async ({ authAdmin }) => {
    await setupMockApi(authAdmin);
    await authAdmin.goto(`${FRONTEND}/app`);
    await expect(authAdmin).toHaveURL(/\/app$/, { timeout: 10000 });
    await authAdmin.fill('input[placeholder="Введите слово..."]', 'apple');
    await authAdmin.click('button:has-text("Узнать")');
    await expect(authAdmin.locator('text=яблоко')).toBeVisible();
    await expect(authAdmin.locator('text=Админ')).toBeVisible();
});

test('Dictionary API возвращает ошибку 401', async ({ authUser }) => {
    // ✅ Wildcard переопределяет setupMockApi — страница ещё не загружена
    await authUser.route('**/api/dictionary*', route =>
        route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ detail: 'Unauthorized' }),
        })
    );
    await authUser.goto(`${FRONTEND}/app`);
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
    await page.goto(`${FRONTEND}/app`);
    await expect(page).toHaveURL(/\/(login)?$/);
    await expect(page.locator('text=Войти')).toBeVisible();
});