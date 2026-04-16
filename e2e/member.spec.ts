import { test, expect } from '@playwright/test';
import { MESSAGES } from '../lib/constants';

test.describe('Member Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('メンバー一覧モーダルが表示され、作成者の削除ボタンが表示されないこと', async ({ page }) => {
    // グループ作成 (可視状態のボタンをクリック)
    const groupName = 'G_' + Date.now();
    await page.getByRole('button', { name: MESSAGES.UI.NEW_GROUP_LABEL }).first().click();
    await page.fill('input[placeholder="' + MESSAGES.UI.GROUP_NAME_EXAMPLE + '"]', groupName);
    await page.click('button[type="submit"]');
    
    // グループページへ移動を待つ
    await page.waitForURL('**/groups/*');
    await expect(page.getByRole('heading', { level: 1, name: groupName })).toBeVisible();

    // メンバーリストを表示 (定数をもとに検索: 参加メンバー ◯名)
    await page.getByRole('button', { name: new RegExp(MESSAGES.UI.MEMBER_LIST + '.*' + MESSAGES.UI.MEMBER_COUNT_UNIT) }).click();
    
    // モーダルタイトル確認 (h2等のヘッディングを考慮)
    await expect(page.getByRole('heading', { name: MESSAGES.UI.MEMBER_LIST })).toBeVisible();

    // 作成者バッジがあることを確認
    await expect(page.getByText(MESSAGES.UI.ROLE_CREATOR)).toBeVisible();

    // 作成者の削除ボタン（ゴミ箱アイコンなど）が存在しないことを確認
    // 条件: 自分が作成者の場合、自分自身の行に削除ボタンは出ないはず
    const memberRow = page.locator('div.flex.items-center.justify-between').filter({ hasText: MESSAGES.UI.ROLE_CREATOR });
    await expect(memberRow.locator('button[title="' + MESSAGES.UI.REMOVE + '"]')).not.toBeVisible();
  });
});
