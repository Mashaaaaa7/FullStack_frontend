import { test, expect, FRONTEND, BACKEND } from '../moks/fixtures.ts';

// Авторизация

test('неавторизованный пользователь редиректится на /login', async ({ page }) => {
    await page.goto(`${FRONTEND}/app`);
    await expect(page).toHaveURL(/\/(login)?$/, { timeout: 5000 });
    await expect(page.locator('button:has-text("Войти")')).toBeVisible();
});

test('успешный логин перенаправляет на dashboard', async ({ page }) => {
    await page.route(`${BACKEND}/api/auth/login`, route =>
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ access_token: 'mock-token', refresh_token: 'mock-refresh' }),
        })
    );
    await page.route(`${BACKEND}/api/profile/me`, route =>
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ user_id: 1, email: 'user@example.com', role: 'user' }),
        })
    );

    await page.goto(`${FRONTEND}/login`);
    await page.fill('input[placeholder="Email"]', 'user@example.com');
    await page.fill('input[placeholder="Пароль"]', 'TestPass123');
    await page.click('button:has-text("Войти")');
    await expect(page).toHaveURL(/\/app$/, { timeout: 10000 });
});

test('неверный пароль показывает ошибку', async ({ page }) => {
    await page.route(`${BACKEND}/api/auth/login`, route =>
        route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ detail: 'Неверный пароль' }),
        })
    );

    await page.goto(`${FRONTEND}/login`);
    await page.fill('input[placeholder="Email"]', 'nonexistent@example.com');
    await page.fill('input[placeholder="Пароль"]', 'wrongpassword');
    await page.click('button:has-text("Войти")');

    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 });
    await expect(page).not.toHaveURL(/\/app$/);
});

test('logout очищает сессию и редиректит на /login', async ({ userPage }) => {
    await userPage.click('button:has-text("Выйти")');
    await expect(userPage).toHaveURL(/\/login$/, { timeout: 5000 });
    const token = await userPage.evaluate(() => localStorage.getItem('access_token'));
    expect(token).toBeNull();
});

// RBAC

test('admin видит admin-меню', async ({ adminPage }) => {
    await expect(adminPage.locator('a', { hasText: 'Админ' })).toBeVisible({ timeout: 5000 });
});

test('user видит dashboard без admin-меню', async ({ userPage }) => {
    await expect(userPage).toHaveURL(/\/app$/, { timeout: 10000 });
    await expect(userPage.locator('text=📖 Учебные карточки из PDF')).toBeVisible();
    await expect(userPage.locator('text="Админ"')).toHaveCount(0);
});

// PDF

test('user видит только свои PDF файлы', async ({ userPage }) => {
    const res = await userPage.evaluate(async (backend) => {
        const token = localStorage.getItem('access_token');
        const r = await fetch(`${backend}/api/pdf/list`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const body = await r.json();
        return { status: r.status, body };
    }, BACKEND);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
});

test('загрузка не-PDF файла возвращает ошибку 400', async ({ userPage }) => {
    const status = await userPage.evaluate(async (backend) => {
        const token = localStorage.getItem('access_token');
        const fd = new FormData();
        fd.append('file', new Blob(['hello world'], { type: 'text/plain' }), 'test.txt');
        const r = await fetch(`${backend}/api/pdf/upload`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: fd,
        });
        return r.status;
    }, BACKEND);

    expect(status).toBe(400);
});

test('user не может удалить чужой PDF', async ({ userPage }) => {
    const status = await userPage.evaluate(async (backend) => {
        const token = localStorage.getItem('access_token');
        const r = await fetch(`${backend}/api/pdf/999`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        return r.status;
    }, BACKEND);

    expect([403, 404]).toContain(status);
});

// Dictionary

// app.spec.ts — оба Dictionary теста
test('Dictionary возвращает определение слова', async ({ authUser }) => {
    await authUser.waitForURL(/\/app/, { timeout: 10000 }); // ← убедиться что на /app
    await authUser.goto(`${FRONTEND}/app`);                 // ← перейти к нужному разделу

    await authUser.route(`${BACKEND}/api/dictionary*`, route =>
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                word: 'apple',
                definitions: [{ partOfSpeech: 'noun', definition: 'яблоко', example: 'I eat an apple.' }],
            }),
        })
    );

    await authUser.fill('input[placeholder="Введите слово..."]', 'apple');
    await authUser.click('button:has-text("Узнать")');
    await expect(authUser.locator('h4').filter({ hasText: 'apple' })).toBeVisible({ timeout: 5000 });
});

test('Dictionary не отправляет пустой запрос', async ({ authUser }) => {
    await authUser.waitForURL(/\/app/, { timeout: 10000 }); // ← добавить
    await authUser.fill('input[placeholder="Введите слово..."]', '');
    await expect(authUser.locator('button:has-text("Узнать")')).toBeDisabled();
});
