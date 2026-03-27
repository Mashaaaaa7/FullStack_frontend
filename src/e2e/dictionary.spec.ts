import { test, expect } from './moks';

test('dictionary success for user', async ({ loginAsUser }) => {
    await loginAsUser.route('**/api/dictionary', route =>
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                cards: [{ id: 1, question: 'Q', answer: 'A' }],
                total: 1
            }),
        })
    );

    await loginAsUser.goto('http://localhost:3000/dictionary');
    await loginAsUser.click('button:has-text("app")');

    await expect(loginAsUser.locator('text=Q')).toBeVisible();
    await expect(loginAsUser.locator('text=A')).toBeVisible();
    await expect(loginAsUser.locator('text=Admin')).toHaveCount(0);
});

test('dictionary 401 shows error', async ({ loginAsUser }) => {
    await loginAsUser.route('**/api/dictionary', route =>
        route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Unauthorized' }),
        })
    );

    await loginAsUser.goto('http://localhost:3000/dictionary');
    await loginAsUser.click('button:has-text("app")');

    await expect(loginAsUser.locator('text=Unauthorized')).toBeVisible();
});

test('dictionary server error fallback', async ({ loginAsUser }) => {
    await loginAsUser.route('**/api/dictionary', route =>
        route.fulfill({
            status: 500,
            contentType: 'application/json',
        })
    );

    await loginAsUser.goto('http://localhost:3000/dictionary');
    await loginAsUser.click('button:has-text("app")');

    await expect(loginAsUser.locator('text=Не удалось загрузить словарь')).toBeVisible();
});

test('logout from dictionary clears session', async ({ loginAsUser }) => {
    await loginAsUser.goto('http://localhost:3000/dictionary');
    await loginAsUser.click('button:has-text("app")');
    await loginAsUser.click('button:has-text("Logout")');

    await expect(loginAsUser).toHaveURL('http://localhost:3000/login');

    const token = await loginAsUser.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
});