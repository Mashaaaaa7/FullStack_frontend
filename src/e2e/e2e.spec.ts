import { test as base, expect, Page } from '@playwright/test';

type CustomFixtures = {
    authUser: Page;
    authAdmin: Page;
    mockApi: Page;
};

export const test = base.extend<CustomFixtures>({
    authUser: async ({ page }, use) => {
        // Устанавливаем токен до загрузки страницы
        await page.addInitScript(() => {
            localStorage.setItem('access_token', 'mock-token');
        });
        // Мокаем запросы
        await page.route('**/api/auth/login', route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ access_token: 'mock-token', refresh_token: 'mock-refresh' }),
            })
        );
        await page.route('**/api/auth/me', route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ user_id: 1, email: 'user@example.com', role: 'user' }),
            })
        );
        await use(page);
    },

    authAdmin: async ({ page }, use) => {
        await page.addInitScript(() => {
            localStorage.setItem('access_token', 'mock-token');
        });
        await page.route('**/api/auth/login', route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ access_token: 'mock-token', refresh_token: 'mock-refresh' }),
            })
        );
        await page.route('**/api/auth/me', route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ user_id: 1, email: 'admin@example.com', role: 'admin' }),
            })
        );
        await use(page);
    },

    mockApi: async ({ page }, use) => {
        await page.route('**/api/pdf/cards/*', route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ cards: [{ id: 1, question: 'Q', answer: 'A' }], total: 1 }),
            })
        );
        await page.route('**/api/dictionary*', route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    word: 'apple',
                    definitions: [{ partOfSpeech: 'noun', definition: 'яблоко', example: 'I eat an apple.' }],
                }),
            })
        );
        await use(page);
    },
});

// -------------------- Тесты --------------------

test('user login показывает dashboard без admin меню', async ({ authUser }) => {
    await authUser.goto('http://localhost:3000/login');
    await authUser.fill('input[placeholder="Email"]', 'user@example.com');
    await authUser.fill('input[placeholder="Пароль"]', 'password');
    await authUser.click('button:has-text("Войти")');

    await expect(authUser).toHaveURL(/\/app$/);
    await expect(authUser.locator('text=📖 Учебные карточки из PDF')).toBeVisible();
    await expect(authUser.locator('text=Админ-панель')).toHaveCount(0);
});

test('admin login показывает admin меню', async ({ authAdmin }) => {
    await authAdmin.goto('http://localhost:3000/login');
    await authAdmin.fill('input[placeholder="Email"]', 'admin@example.com');
    await authAdmin.fill('input[placeholder="Пароль"]', 'password');
    await authAdmin.click('button:has-text("Войти")');

    await expect(authAdmin).toHaveURL(/\/app$/);
    await expect(authAdmin.locator('text=Админ-панель')).toBeVisible();
});

test('user может logout и сессия очищена', async ({ authUser }) => {
    await authUser.goto('http://localhost:3000/app');
    await authUser.click('button:has-text("Выйти")');
    await expect(authUser).toHaveURL(/\/login$/);
    const token = await authUser.evaluate(() => localStorage.getItem('access_token'));
    expect(token).toBeNull();
});

test('user просмотр PDF карточек', async ({ authUser, mockApi }) => {
    void mockApi;
    await authUser.goto('http://localhost:3000/app');
    await expect(authUser.locator('text=Q')).toBeVisible();
    await expect(authUser.locator('text=A')).toBeVisible();
});

test('admin просмотр PDF карточек', async ({ authAdmin, mockApi }) => {
    void mockApi;
    await authAdmin.goto('http://localhost:3000/app');
    await expect(authAdmin.locator('text=Q')).toBeVisible();
    await expect(authAdmin.locator('text=A')).toBeVisible();
});

test('user Dictionary API показывает определение', async ({ authUser, mockApi }) => {
    void mockApi;
    await authUser.goto('http://localhost:3000/app');
    const input = authUser.locator('input[placeholder="Введите слово..."]');
    await input.fill('apple');
    await authUser.click('button:has-text("Узнать")');
    await expect(authUser.locator('text=яблоко')).toBeVisible();
    await expect(authUser.locator('text=Админ-панель')).toHaveCount(0);
});

test('admin Dictionary API показывает определение и админ-меню', async ({ authAdmin, mockApi }) => {
    void mockApi;
    await authAdmin.goto('http://localhost:3000/app');
    const input = authAdmin.locator('input[placeholder="Введите слово..."]');
    await input.fill('apple');
    await authAdmin.click('button:has-text("Узнать")');
    await expect(authAdmin.locator('text=яблоко')).toBeVisible();
    await expect(authAdmin.locator('text=Админ-панель')).toBeVisible();
});

test('Dictionary API возвращает ошибку 401', async ({ authUser, page }) => {
    await page.route('**/api/dictionary*', route =>
        route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ detail: 'Unauthorized' }),
        })
    );
    await authUser.goto('http://localhost:3000/app');
    const input = authUser.locator('input[placeholder="Введите слово..."]');
    await input.fill('apple');
    await authUser.click('button:has-text("Узнать")');
    await expect(authUser.locator('text=Не удалось загрузить определение')).toBeVisible();
});

test('неавторизованный пользователь редиректится на login', async ({ page }) => {
    await page.route('**/api/auth/me', route =>
        route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ detail: 'Unauthorized' }),
        })
    );
    await page.goto('http://localhost:3000/app');
    // Если ваша маршрутизация перенаправляет на '/', а не на '/login', измените ожидание
    // Например, ожидайте '/' и проверяйте наличие кнопки "Войти" на главной
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('text=Войти')).toBeVisible();
});