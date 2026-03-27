import { test, expect } from './moks';

test('user login shows dashboard', async ({ loginAsUser }) => {
    await loginAsUser.goto('http://localhost:3000/login');
    await loginAsUser.fill('input[name="email"]', 'mashavacylieva@gmail.com');
    await loginAsUser.fill('input[name="password"]', 'password');
    await loginAsUser.click('button:has-text("Login")');
    await expect(loginAsUser.locator('text=Admin')).toHaveCount(0);
});

test('admin login shows admin menu', async ({ loginAsAdmin }) => {
    await loginAsAdmin.goto('http://localhost:3000/login');
    await loginAsAdmin.fill('input[name="email"]', 'mary200438@gmail.com');
    await loginAsAdmin.fill('input[name="password"]', 'password');
    await loginAsAdmin.click('button:has-text("Login")');
    await expect(loginAsAdmin.locator('text=Admin')).toBeVisible();
});

test('view PDF cards', async ({ mockPdfApi}) => {
    await mockPdfApi.goto('http://localhost:3000/login');
    await mockPdfApi.fill('input[name="email"]', 'mashavacylieva@gmail.com');
    await mockPdfApi.fill('input[name="password"]', 'password');
    await mockPdfApi.click('button:has-text("Login")');
    await expect(mockPdfApi.locator('text=Карточки из "')).toBeVisible();
    await expect(mockPdfApi.locator('text=Q')).toBeVisible();
    await expect(mockPdfApi.locator('text=A')).toBeVisible();
});