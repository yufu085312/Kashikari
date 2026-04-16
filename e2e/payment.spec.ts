import { test, expect } from '@playwright/test';
import { MESSAGES } from '../lib/constants';

test.describe('Payment Lifecycle Flow', () => {
  test('グループ内で支払いを記録し、一覧に表示され、削除できること', async ({ page }) => {
    // 1. ホーム画面へ
    await page.goto('/');
    
    // 2. テスト用グループの作成 (新規ユーザー対策)
    const timestamp = Date.now().toString().slice(-6);
    const groupName = `G_PAY_${timestamp}`;
    
    await page.getByRole('button', { name: MESSAGES.UI.NEW_GROUP_LABEL }).first().click();
    await page.getByPlaceholder(MESSAGES.UI.GROUP_NAME_EXAMPLE).fill(groupName);
    await page.getByRole('button', { name: MESSAGES.UI.GROUP_CREATE }).last().click();
    
    // グループ詳細画面への遷移を確認
    await expect(page.getByRole('heading', { level: 1, name: groupName })).toBeVisible();

    // 3. 支払い登録モーダルを開く
    await page.getByRole('button', { name: MESSAGES.UI.PAYMENT_RECORD }).click();
    
    // 4. 金額を入力
    const amount = '1500';
    await page.getByPlaceholder('0').fill(amount);
    
    // 5. 理由を入力
    const memo = `E2E Test Payment ${Date.now()}`;
    await page.getByPlaceholder(MESSAGES.UI.PAYMENT_MEMO_PLACEHOLDER).fill(memo);
    
    // 6. 支払いを記録
    await page.getByRole('button', { name: MESSAGES.UI.PAYMENT_ADD }).click();
    
    // 7. モーダルが閉じ、履歴タブに遷移して内容が表示されるか確認
    // 自動で履歴タブが開かない場合は手動でクリック
    await page.getByRole('button', { name: MESSAGES.UI.TAB_HISTORY }).click();
    // 8. 正しく表示されているか確認 (メモを基準に検索)
    const paymentRow = page.locator('div.p-4').filter({ hasText: memo });
    await expect(paymentRow).toBeVisible({ timeout: 10000 });
    // 金額が含まれていることを確認
    await expect(paymentRow).toContainText('1,500');
    
    // 9. 支払いを削除 (特定の行のボタンをクリック)
    await paymentRow.getByTitle(MESSAGES.UI.PAYMENT_DELETE_ACTION).click();
    
    // 確認ダイアログ（alert-provider の confirm）が表示される
    // "削除する" ボタンをクリック
    await page.getByRole('button', { name: MESSAGES.UI.DELETE_EXECUTE }).click();
    
    // 10. 消えたことを確認
    await expect(page.getByText(memo)).not.toBeVisible();
  });
});
