import { test, expect } from '@playwright/test';
import { MESSAGES } from '../lib/constants';

// auth.spec.ts はログイン確認用のテストのため、storageState を使用しない（リセットする）
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Authentication Flow', () => {
  test('ログインページが表示されること', async ({ page }) => {
    await page.goto('/login');
    // ブランド名が表示されているか
    await expect(page.getByText('Kashikari', { exact: true }).first()).toBeVisible();
    // ログインフォームのタイトルが表示されているか
    await expect(page.getByRole('heading', { name: MESSAGES.UI.LOGIN })).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('バリデーションエラーが表示されること', async ({ page }) => {
    await page.goto('/login');
    // 空のまま送信
    await page.click('button[type="submit"]');
    
    // エラーメッセージが表示されるか
    await expect(page.getByText(MESSAGES.ERROR.EMAIL_REQUIRED)).toBeVisible();
    await expect(page.getByText(MESSAGES.ERROR.PASSWORD_REQUIRED)).toBeVisible();
    
    // 不正なメール形式
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page.getByText(MESSAGES.ERROR.EMAIL_INVALID)).toBeVisible();
  });
});
