import { test, expect } from '@playwright/test';
import { MESSAGES } from '../lib/constants';

test.describe('Profile Management', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン済みの状態で開始 (storageState が playwright.config.ts で設定されている想定)
    await page.goto('/');
  });

  test('プロフィール編集モーダルが開くこと', async ({ page }) => {
    // 設定ボタンをクリック (歯車アイコン)
    await page.click('button[title="' + MESSAGES.UI.SETTINGS_LABEL + '"]');
    // プロフィール表示をクリック
    await page.getByRole('button', { name: MESSAGES.UI.PROFILE_VIEW_TITLE }).click();

    // 編集ボタンをクリック
    await page.getByRole('button', { name: MESSAGES.UI.PROFILE_EDIT_TITLE }).click();

    // モーダルのタイトルを確認
    const modalTitle = page.getByRole('heading', { name: MESSAGES.UI.PROFILE_EDIT_TITLE });
    await expect(modalTitle).toBeVisible();

    // 入力フィールドが表示されているか
    await expect(page.getByLabel(MESSAGES.UI.NAME_LABEL)).toBeVisible();
    await expect(page.getByLabel(MESSAGES.UI.SEARCH_ID_LABEL)).toBeVisible();
  });

  test('表示名を変更できること', async ({ page }) => {
    const newName = '新テスト名_' + Date.now();

    await page.click('button[title="' + MESSAGES.UI.SETTINGS_LABEL + '"]');
    await page.getByRole('button', { name: MESSAGES.UI.PROFILE_VIEW_TITLE }).click();
    await page.getByRole('button', { name: MESSAGES.UI.PROFILE_EDIT_TITLE }).click();

    // 表示名を変更
    const nameInput = page.locator('input').first();
    await nameInput.fill(newName);
    
    // 保存ボタンをクリック
    await page.click('button:has-text("' + MESSAGES.UI.SAVE + '")');

    // 成功メッセージの確認
    await expect(page.getByText(MESSAGES.UI.PROFILE_UPDATE_SUCCESS)).toBeVisible();
    
    // 表示モードのモーダルに切り替わっているか確認
    const viewModalTitle = page.getByRole('heading', { name: MESSAGES.UI.PROFILE_VIEW_TITLE });
    await expect(viewModalTitle).toBeVisible();

    // 挨拶が更新されているか（モーダル内に表示）
    await expect(page.getByText(newName)).toBeVisible();
  });

  test('検索IDを変更できること', async ({ page }) => {
    const newSearchId = 'new_id_' + Date.now();

    await page.click('button[title="' + MESSAGES.UI.SETTINGS_LABEL + '"]');
    await page.click('text=' + MESSAGES.UI.PROFILE_VIEW_TITLE);
    await page.click('button:has-text("' + MESSAGES.UI.PROFILE_EDIT_TITLE + '")');

    // 検索IDを変更
    const idInput = page.locator('input').nth(1);
    await idInput.fill(newSearchId);
    
    await page.click('button:has-text("' + MESSAGES.UI.SAVE + '")');

    await expect(page.getByText(MESSAGES.UI.PROFILE_UPDATE_SUCCESS)).toBeVisible();
    
    const viewModalTitle = page.getByRole('heading', { name: MESSAGES.UI.PROFILE_VIEW_TITLE });
    await expect(viewModalTitle).toBeVisible();

    // ID表示が更新されているか（モーダル内）
    await expect(page.getByText(newSearchId)).toBeVisible();
  });

  test('バリデーションエラーが表示されること', async ({ page }) => {
    await page.click('button[title="' + MESSAGES.UI.SETTINGS_LABEL + '"]');
    await page.click('text=' + MESSAGES.UI.PROFILE_VIEW_TITLE);
    await page.click('button:has-text("' + MESSAGES.UI.PROFILE_EDIT_TITLE + '")');

    // 表示名を空にする
    const nameInput = page.locator('input').first();
    await nameInput.fill('');
    
    await page.click('button:has-text("' + MESSAGES.UI.SAVE + '")');

    // エラーメッセージの確認
    await expect(page.getByText(MESSAGES.ERROR.NAME_REQUIRED)).toBeVisible();
    
    // 不正な検索ID
    const idInput = page.locator('input').nth(1);
    await idInput.fill('不正なID！');
    await page.click('button:has-text("' + MESSAGES.UI.SAVE + '")');
    await expect(page.getByText(MESSAGES.ERROR.SEARCH_ID_INVALID)).toBeVisible();
  });

  test('パスワードを変更できること', async ({ page }) => {
    const newPassword = 'newPassword123';

    await page.click('button[title="' + MESSAGES.UI.SETTINGS_LABEL + '"]');
    await page.getByRole('button', { name: MESSAGES.UI.CHANGE_PASSWORD_TITLE }).click();

    // 新しいパスワードを入力
    await page.fill('input[name="password"]', newPassword);
    await page.fill('input[name="confirm_password"]', newPassword);
    
    await page.click('button:has-text("' + MESSAGES.UI.SAVE + '")');

    // 成功メッセージの確認
    await expect(page.getByText(MESSAGES.UI.PASSWORD_UPDATE_SUCCESS)).toBeVisible();
    await page.waitForSelector('text=' + MESSAGES.UI.CHANGE_PASSWORD_TITLE, { state: 'hidden', timeout: 5000 });

    // 【重要】テスト環境を壊さないよう、パスワードを元に戻しておく
    const originalPassword = process.env.E2E_USER_PASSWORD || 'password123';
    await page.click('button[title="' + MESSAGES.UI.SETTINGS_LABEL + '"]');
    await page.getByRole('button', { name: MESSAGES.UI.CHANGE_PASSWORD_TITLE }).click();
    await page.fill('input[name="password"]', originalPassword);
    await page.fill('input[name="confirm_password"]', originalPassword);
    await page.click('button:has-text("' + MESSAGES.UI.SAVE + '")');
    await expect(page.getByText(MESSAGES.UI.PASSWORD_UPDATE_SUCCESS)).toBeVisible();
  });
});
