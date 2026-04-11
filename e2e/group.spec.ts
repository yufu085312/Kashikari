import { test, expect } from '@playwright/test';
import { MESSAGES } from '../lib/constants';

// e2e用のテストユーザー情報（global-setup.ts で設定したものと一致させる）
const TEST_EMAIL = process.env.E2E_USER_EMAIL || 'test-user@example.com';

test.describe('Group Management Flow', () => {
  test('ホーム画面にアクセスし、新規グループを作成して詳細画面を表示する', async ({ page }) => {
    // 1. ホーム画面へのアクセス
    // global-setup.ts で認証済みクッキーを持っているため、/ にアクセスすると直接ホームが表示される
    await page.goto('/');
    
    // もしログイン画面に飛ばされた場合はセットアップエラー
    await expect(page).toHaveURL('http://localhost:3000/');
    
    // 2. ヘッダーやユーザー名の表示確認
    await expect(page.getByText(MESSAGES.UI.APP_TAGLINE)).toBeVisible();
    
    // 3. グループ作成モーダルの表示
    // "新しいグループを作成" ボタンを探してクリック
    // 注意: ホーム画面には複数ボタンがあるかもしれないので、テキストで検索
    // デスクトップ用とモバイル用のFABがあるため、最初のもの（または明示的なもの）をクリック
    const createButton = page.locator('button', { hasText: MESSAGES.UI.NEW_GROUP_LABEL }).first();
    await createButton.click();
    
    // 4. グループ名の入力と作成
    // 文字数制限(20文字)に収まるように調整
    const timestamp = Date.now().toString().slice(-6);
    const groupName = `E2E ${timestamp}`;
    
    // // モーダル内の input を取得
    // Group Form の input placeholder 
    const nameInput = page.getByPlaceholder(MESSAGES.UI.GROUP_NAME_EXAMPLE);
    await nameInput.fill(groupName);
    
    // 作成するボタンをクリック
    const submitButton = page.getByRole('button', { name: MESSAGES.UI.GROUP_CREATE }).last(); // Modal title may also match 'button', use exact or last
    await submitButton.click();
    
    // 5. グループ詳細画面への遷移確認
    // URLが /groups/UUID になるのを待機
    await page.waitForURL(/\/groups\/[a-zA-Z0-9-]+/);
    
    // ヘッダー（タイトル）に作成したグループ名が表示されていること
    await expect(page.locator('h1')).toHaveText(groupName);
  });
});
