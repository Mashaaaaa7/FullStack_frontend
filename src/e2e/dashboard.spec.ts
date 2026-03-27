import { test, expect } from './moks';

test('user login shows dashboard', async ({ loginAsUser }) => {
    // Мокаем login API до перехода
    await loginAsUser.route('**/api/auth/login', route =>
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ email: 'mashavacylieva@gmail.com', role: 'user' }),
        })
    );

    await loginAsUser.goto('http://localhost:3000/login');
    await loginAsUser.fill('input[name="email"]', 'mashavacylieva@gmail.com');
    await loginAsUser.fill('input[name="password"]', 'password');
    await loginAsUser.click('button:has-text("Login")');

    // User не видит admin меню
    await expect(loginAsUser.locator('text=Admin')).toHaveCount(0);
});

test('admin login shows admin menu', async ({ loginAsAdmin }) => {
    await loginAsAdmin.goto('http://localhost:3000/login');
    await loginAsAdmin.fill('input[name="email"]', 'mary200438@gmail.com');
    await loginAsAdmin.fill('input[name="password"]', 'password');
    await loginAsAdmin.click('button:has-text("Login")');

    // Admin видит меню admin
    await expect(loginAsAdmin.locator('text=Admin')).toBeVisible();
});

test('login fails with 401 shows error', async ({ loginAsUser }) => {
    // Мокаем login API на 401
    await loginAsUser.route('**/api/auth/login', route =>
        route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Invalid credentials' }),
        })
    );

    await loginAsUser.goto('http://localhost:3000/login');
    await loginAsUser.fill('input[name="email"]', 'wrong@example.com');
    await loginAsUser.fill('input[name="password"]', 'wrongpass');
    await loginAsUser.click('button:has-text("Login")');

    // Проверка UI
    await expect(loginAsUser.locator('text=Invalid credentials')).toBeVisible();
});

test('view PDF cards successfully', async ({ mockPdfApi }) => {
    await mockPdfApi.goto('http://localhost:3000/login');
    await mockPdfApi.fill('input[name="email"]', 'mashavacylieva@gmail.com');
    await mockPdfApi.fill('input[name="password"]', 'password');
    await mockPdfApi.click('button:has-text("Login")');

    // Проверяем, что карточки видны
    await expect(mockPdfApi.locator('text=Карточки из "')).toBeVisible();
    await expect(mockPdfApi.locator('text=Q')).toBeVisible();
    await expect(mockPdfApi.locator('text=A')).toBeVisible();
});

test('logout redirects to /login and clears session', async ({ loginAsUser }) => {
    await loginAsUser.goto('http://localhost:3000/login');
    await loginAsUser.fill('input[name="email"]', 'mashavacylieva@gmail.com');
    await loginAsUser.fill('input[name="password"]', 'password');
    await loginAsUser.click('button:has-text("Login")');

    // Кликаем logout
    await loginAsUser.click('button:has-text("Logout")');

    // Проверяем редирект на /login
    await expect(loginAsUser).toHaveURL('http://localhost:3000/login');

    // Можно проверить очистку session/localStorage
    const token = await loginAsUser.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
});

test('view PDF cards with fallback on server error', async ({ mockPdfApi }) => {
    await mockPdfApi.route('**/api/pdf/**', route =>
        route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Server error' }),
        })
    );

    await mockPdfApi.goto('http://localhost:3000/login');
    await mockPdfApi.fill('input[name="email"]', 'mashavacylieva@gmail.com');
    await mockPdfApi.fill('input[name="password"]', 'password');
    await mockPdfApi.click('button:has-text("Login")');

    await expect(mockPdfApi.locator('text=Не удалось загрузить PDF')).toBeVisible();
});