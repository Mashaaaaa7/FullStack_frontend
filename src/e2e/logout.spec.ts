import { test, expect } from './moks';

test('user can logout and session is cleared', async ({ loginAsUser }) => {
    await loginAsUser.goto('http://localhost:3000/dashboard');

    // Нажимаем Logout
    await loginAsUser.click('button:has-text("Logout")');

    // Проверяем редирект на /login
    await expect(loginAsUser).toHaveURL(/\/login$/);

    // Dashboard больше не виден
    await expect(loginAsUser.locator('text=Учебные карточки')).toHaveCount(0);
});