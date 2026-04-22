import { test, expect, FRONTEND, BACKEND } from '../moks/fixtures.ts';

test.describe('Авторизация', () => {
    test('неавторизованный пользователь редиректится на /login', async ({ page }) => {
        await page.goto(`${FRONTEND}/app`);

        await expect(page).toHaveURL(/\/(login)?$/, { timeout: 5000 });
        await expect(page.getByRole('button', { name: 'Войти' })).toBeVisible();
    });

    test('успешный логин перенаправляет на dashboard', async ({ page }) => {
        await page.route(`${BACKEND}/api/auth/login`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    access_token: 'mock-token',
                    refresh_token: 'mock-refresh',
                }),
            });
        });

        await page.route(`${BACKEND}/api/profile/me`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    user_id: 1,
                    email: 'user@example.com',
                    role: 'user',
                }),
            });
        });

        await page.goto(`${FRONTEND}/login`);
        await page.getByPlaceholder('Email').fill('user@example.com');
        await page.getByPlaceholder('Пароль').fill('TestPass123');
        await page.getByRole('button', { name: 'Войти' }).click();

        await expect(page).toHaveURL(/\/app$/, { timeout: 10000 });
    });

    test('неверный пароль показывает ошибку', async ({ page }) => {
        await page.route(`${BACKEND}/api/auth/login`, async (route) => {
            await route.fulfill({
                status: 401,
                contentType: 'application/json',
                body: JSON.stringify({ detail: 'Неверный пароль' }),
            });
        });

        await page.goto(`${FRONTEND}/login`);
        await page.getByPlaceholder('Email').fill('nonexistent@example.com');
        await page.getByPlaceholder('Пароль').fill('wrongpassword');
        await page.getByRole('button', { name: 'Войти' }).click();

        await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });
        await expect(page).not.toHaveURL(/\/app$/);
    });

    test('logout очищает сессию и редиректит на /login', async ({ userPage }) => {
        await userPage.getByRole('button', { name: 'Выйти' }).click();

        await expect(userPage).toHaveURL(/\/login$/, { timeout: 5000 });

        const token = await userPage.evaluate(() => localStorage.getItem('access_token'));
        expect(token).toBeNull();
    });
});

test.describe('RBAC', () => {
    test('admin видит admin-меню', async ({ adminPage }) => {
        await expect(
            adminPage.getByRole('link', { name: /админ/i })
        ).toBeVisible({ timeout: 5000 });
    });

    test('user видит dashboard без admin-меню', async ({ userPage }) => {
        await expect(userPage).toHaveURL(/\/app$/, { timeout: 10000 });
        await expect(userPage.getByText('📖 Учебные карточки из PDF')).toBeVisible();
        await expect(userPage.getByText('Админ')).toHaveCount(0);
    });
});

test.describe('PDF', () => {
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
});

test.describe('Dictionary', () => {
    test('Dictionary возвращает определение слова', async ({ authUser }) => {
        await authUser.route(`${BACKEND}/api/dictionary*`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    word: 'apple',
                    phonetic: null,
                    definitions: [
                        {
                            partOfSpeech: 'noun',
                            definition: 'яблоко',
                            example: 'I eat an apple.',
                        },
                    ],
                }),
            });
        });

        await authUser.goto(`${FRONTEND}/app`);

        await authUser.getByPlaceholder('Введите слово...').fill('apple');
        await authUser.getByRole('button', { name: 'Узнать' }).click();

        await expect(
            authUser.getByRole('heading', { level: 4, name: /apple/i })
        ).toBeVisible({ timeout: 5000 });

        await expect(authUser.getByText(/яблоко/i)).toBeVisible();
    });

    test('Dictionary не отправляет пустой запрос', async ({ authUser }) => {
        await authUser.goto(`${FRONTEND}/app`);

        await authUser.getByPlaceholder('Введите слово...').fill('');
        await expect(
            authUser.getByRole('button', { name: 'Узнать' })
        ).toBeDisabled();
    });
});