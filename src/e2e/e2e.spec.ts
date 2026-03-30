import { test as base, expect, Page } from '@playwright/test';

// Кастомные фикстуры
type CustomFixtures = {
    authUser: Page;
    authAdmin: Page;
    mockApi: Page;
};

export const test = base.extend<CustomFixtures>({
    // Логин как обычный пользователь
    authUser: async ({ page }, use) => {
        await page.route('**/api/auth/login', route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ email: 'user@example.com', role: 'user', token: 'mock-token' }),
            })
        );

        await page.route('**/api/auth/me', route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ user_id: 1, email: 'user@example.com', role: 'user' }),
            })
        );

        await page.evaluate(() => localStorage.setItem('access_token', 'mock-token'));
        await use(page);
    },

    // Логин как админ
    authAdmin: async ({ page }, use) => {
        await page.route('**/api/auth/login', route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ email: 'admin@example.com', role: 'admin', token: 'mock-token' }),
            })
        );

        await page.route('**/api/auth/me', route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ user_id: 1, email: 'admin@example.com', role: 'admin' }),
            })
        );

        await page.evaluate(() => localStorage.setItem('access_token', 'mock-token'));
        await use(page);
    },

    // Универсальный мок для PDF и Dictionary API
    mockApi: async ({ page }, use) => {
        await page.route('**/api/pdf/**', route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ cards: [{ id: 1, question: 'Q', answer: 'A' }], total: 1 }),
            })
        );

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


// user login – не видит admin меню
test('user login показывает dashboard без admin меню', async ({ authUser }) => {
    await authUser.goto('http://localhost:3000/login');
    await authUser.fill('input[name="email"]', 'user@example.com');
    await authUser.fill('input[name="password"]', 'password');
    await authUser.click('button:has-text("Войти")');

    await expect(authUser.locator('text=Карточки из "')).toBeVisible();
    await expect(authUser.locator('text=Admin')).toHaveCount(0);
});

// admin login – видит admin меню
test('admin login показывает admin меню', async ({ authAdmin }) => {
    await authAdmin.goto('http://localhost:3000/login');
    await authAdmin.fill('input[name="email"]', 'admin@example.com');
    await authAdmin.fill('input[name="password"]', 'password');
    await authAdmin.click('button:has-text("Войти")');

    await expect(authAdmin.locator('text=Admin')).toBeVisible();
});


test('user может logout и session очищена', async ({ authUser }) => {
    await authUser.goto('http://localhost:3000/dashboard');
    await authUser.click('button:has-text("Logout")');

    await expect(authUser).toHaveURL(/\/login$/);
    const token = await authUser.evaluate(() => localStorage.getItem('access_token'));
    expect(token).toBeNull();
});


test('user просмотр PDF карточек', async ({ authUser}) => {
    await authUser.goto('http://localhost:3000/dashboard');
    await expect(authUser.locator('text=Карточки из "')).toBeVisible();
    await expect(authUser.locator('text=Q')).toBeVisible();
    await expect(authUser.locator('text=A')).toBeVisible();
});

test('admin просмотр PDF карточек', async ({ authAdmin}) => {
    await authAdmin.goto('http://localhost:3000/dashboard');
    await expect(authAdmin.locator('text=Карточки из "')).toBeVisible();
    await expect(authAdmin.locator('text=Q')).toBeVisible();
    await expect(authAdmin.locator('text=A')).toBeVisible();
});


test('user Dictionary API показывает карточки', async ({ authUser }) => {
    await authUser.goto('http://localhost:3000/dictionary');
    await authUser.fill('input[placeholder*="Введите слово"]', 'apple');
    await authUser.click('button:has-text("Узнать")');

    await expect(authUser.locator('text=Q')).toBeVisible();
    await expect(authUser.locator('text=A')).toBeVisible();
    await expect(authUser.locator('text=Admin')).toHaveCount(0);
});

test('admin Dictionary API показывает карточки', async ({ authAdmin }) => {
    await authAdmin.goto('http://localhost:3000/dictionary');
    await authAdmin.fill('input[placeholder*="Введите слово"]', 'apple');
    await authAdmin.click('button:has-text("Узнать")');

    await expect(authAdmin.locator('text=Q')).toBeVisible();
    await expect(authAdmin.locator('text=A')).toBeVisible();
    await expect(authAdmin.locator('text=Admin')).toBeVisible(); // Admin меню видно
});

test('Dictionary API возвращает ошибку 401', async ({ authUser, page }) => {
    await authUser.goto('http://localhost:3000/dictionary');

    await page.route('**/api/dictionary', route =>
        route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ detail: 'Unauthorized' }),
        })
    );

    await authUser.fill('input[placeholder*="Введите слово"]', 'apple');
    await authUser.click('button:has-text("Узнать")');

    await expect(authUser.locator('text=Unauthorized')).toBeVisible();
});

test('неавторизованный пользователь редиректится на login', async ({ page }) => {
    await page.route('**/api/auth/me', route =>
        route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ detail: 'Unauthorized' }),
        })
    );

    await page.goto('http://localhost:3000/dashboard');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator('text=Вы не авторизованы')).toBeVisible();
});