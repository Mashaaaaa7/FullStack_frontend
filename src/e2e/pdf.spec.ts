import { test, expect } from './moks';

test('PDF API fallback shows error message', async ({ mockPdfApi }) => {
    // Подменяем API на ошибку
    await mockPdfApi.route('**/api/pdf/**', route =>
        route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Server error' }),
        })
    );

    await mockPdfApi.goto('http://localhost:3000/pdf');

    // Проверяем отображение fallback
    await expect(mockPdfApi.locator('text=Не удалось загрузить PDF')).toBeVisible();
});