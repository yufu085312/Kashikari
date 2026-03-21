import { test, expect } from '@playwright/test';

// auth.spec.ts はログイン確認用のテストのため、storageState を使用しない（リセットする）
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Authentication Flow', () => {
  test('ログインページが表示されること', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toHaveText('Kashikari');
    await expect(page.locator('h2')).toHaveText('ログイン');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('バリデーションエラーが表示されること', async ({ page }) => {
    await page.goto('/login');
    // 空のまま送信
    await page.click('button[type="submit"]');
    
    // エラーメッセージが表示されるか
    await expect(page.getByText('メールアドレスを入力してください')).toBeVisible();
    await expect(page.getByText('パスワードを入力してください')).toBeVisible();
    
    // 不正なメール形式
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page.getByText('正しいメールアドレスの形式で入力してください')).toBeVisible();
  });
});
