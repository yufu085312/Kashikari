import { test, expect } from '@playwright/test';
import { MESSAGES } from '../lib/constants';

test.describe('Account Deletion Flow', () => {
  // グローバルなログイン状態を引き継がない（未ログインから開始する）
  test.use({ storageState: { cookies: [], origins: [] } });

  // 削除テストは他への影響を避けるため、毎回新規のユーザーを作成して行う
  const testEmail = `delete-test-${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  const testName = 'Delete Test User';
  const testSearchId = `deltest_${Date.now()}`;

  test('新規ユーザー作成後にアカウントを削除できること', async ({ page }) => {
    // 1. サインアップ
    await page.goto('/signup');
    await page.fill('input[name="name"]', testName);
    await page.fill('input[name="search_id"]', testSearchId);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');

    // ホーム画面（/）への遷移を待機
    await page.waitForURL('**/', { timeout: 15000 });
    
    // 2. アカウント設定モーダルを開く
    // 歯車ボタンをクリック
    await page.click(`button[title="${MESSAGES.UI.SETTINGS_LABEL}"]`);
    // 「アカウント設定」をクリック
    await page.click(`text=${MESSAGES.UI.PROFILE_VIEW_TITLE}`);

    // モーダルが表示されていることを確認
    await expect(page.getByRole('heading', { name: MESSAGES.UI.PROFILE_VIEW_TITLE })).toBeVisible();

    // 3. アカウント削除を実行
    // 「アカウントの削除」ボタンをクリック
    await page.click(`text=${MESSAGES.UI.DELETE_ACCOUNT}`);

    // 確認モーダルが表示されることを確認
    await expect(page.getByText(MESSAGES.UI.CONFIRM_DELETE_ACCOUNT)).toBeVisible();

    // 「削除する」ボタンをクリック
    await page.click(`button:has-text("${MESSAGES.UI.DELETE_EXECUTE}")`);

    // 4. 結果の検証
    // トップページ（LP）にリダイレクトされることを確認
    await page.waitForURL('**/', { timeout: 15000 });
    await expect(page.getByText(MESSAGES.LANDING.CTA_FREE)).toBeVisible();
    
    // ログインできないことを確認（オプションだが、Authから消えているかの確認）
    await page.goto('/login');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');
    await expect(page.getByText(MESSAGES.ERROR.LOGIN_FAILED)).toBeVisible();
  });
});
