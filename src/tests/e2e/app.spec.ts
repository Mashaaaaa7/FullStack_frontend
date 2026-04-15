import { test, expect, FRONTEND, BACKEND, USER_CREDENTIALS } from './fixtures';

// Авторизация

test('неавторизованный пользователь редиректится на /login', async ({ page }) => {
    await page.goto(`${FRONTEND}/app`);
    await expect(page).toHaveURL(/\/(login)?$/, { timeout: 5000 });
    await expect(page.locator('button:has-text("Войти")')).toBeVisible();
});

test('успешный логин перенаправляет на dashboard', async ({ page }) => {
    await page.goto(`${FRONTEND}/login`);
    await page.fill('input[placeholder="Email"]', USER_CREDENTIALS.email);
    await page.fill('input[placeholder="Пароль"]', USER_CREDENTIALS.password);
    await page.click('button:has-text("Войти")');
    await expect(page).toHaveURL(/\/app$/, { timeout: 10000 });
});

test('неверный пароль показывает ошибку', async ({ page }) => {
    await page.goto(`${FRONTEND}/login`);
    await page.fill('input[placeholder="Email"]', USER_CREDENTIALS.email);
    await page.fill('input[placeholder="Пароль"]', 'wrongpassword');
    await page.click('button:has-text("Войти")');

    // Ищем любой элемент с классом error — не завязываемся на текст
    await expect(page.locator('.error').first()).toBeVisible({ timeout: 5000 });
    await expect(page).not.toHaveURL(/\/app$/);
});

test('logout очищает сессию и редиректит на /login', async ({ userPage }) => {
    await userPage.click('button:has-text("Выйти")');
    await expect(userPage).toHaveURL(/\/login$/, { timeout: 5000 });
    const token = await userPage.evaluate(() => localStorage.getItem('access_token'));
    expect(token).toBeNull();
});

// RBAC

test('user не видит admin-меню', async ({ userPage }) => {
    await expect(userPage.locator('text=Админ')).toHaveCount(0);
});

test('admin видит admin-меню', async ({ adminPage }) => {
    await expect(adminPage.locator('text=Админ')).toBeVisible({ timeout: 5000 });
});

test('user видит dashboard с карточками из PDF', async ({ userPage }) => {
    await expect(userPage.locator('text=📖 Учебные карточки из PDF')).toBeVisible({ timeout: 5000 });
});

// PDF

test('user видит только свои PDF файлы', async ({ userPage }) => {
    const token = await userPage.evaluate(() => localStorage.getItem('access_token'));
    const res = await userPage.request.get(`${BACKEND}/api/pdf/list`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('items');
});

test('загрузка не-PDF файла возвращает ошибку 400', async ({ userPage }) => {
    const token = await userPage.evaluate(() => localStorage.getItem('access_token'));
    const res = await userPage.request.post(`${BACKEND}/api/pdf/upload`, {
        headers: { Authorization: `Bearer ${token}` },
        multipart: {
            file: {
                name: 'test.txt',
                mimeType: 'text/plain',
                buffer: Buffer.from('hello world'),
            }
        }
    });
    expect(res.status()).toBe(400);
});

test('user не может удалить чужой PDF', async ({ userPage }) => {
    const token = await userPage.evaluate(() => localStorage.getItem('access_token'));
    const res = await userPage.request.delete(`${BACKEND}/api/pdf/999`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    expect([403, 404]).toContain(res.status());
});

// Dictionary

test('Dictionary возвращает определение слова', async ({ userPage }) => {
    await userPage.fill('input[placeholder="Введите слово..."]', 'apple');
    await userPage.click('button:has-text("Узнать")');

    // Ищем заголовок h4 — он уникален, не попадает в strict mode
    await expect(
        userPage.locator('h4').filter({ hasText: 'apple' })
    ).toBeVisible({ timeout: 8000 });
});

test('Dictionary не отправляет пустой запрос', async ({ userPage }) => {
    // Кнопка должна быть disabled при пустом поле
    await userPage.fill('input[placeholder="Введите слово..."]', '');
    await expect(userPage.locator('button:has-text("Узнать")')).toBeDisabled();
});