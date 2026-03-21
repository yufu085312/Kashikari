import { chromium, type FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // 環境変数からテストユーザーを取得。なければ適当なデフォルト値。
  const email = process.env.E2E_USER_EMAIL || 'test-user@example.com';
  const password = process.env.E2E_USER_PASSWORD || 'password123';
  
  // baseUrl があれば設定から取得
  const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';

  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();

  console.log(`E2E Login starting for ${email}...`);

  // Supabase で Auth モックが難しい場合は UI を叩く
  // 実際には e2e用のテストユーザーをSupabaseのDashboardで作成しておく必要があります
  try {
    await page.goto('/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    // エラーメッセージが出たら新規登録にフォールバック
    const errorMsg = page.getByText('メールアドレスまたはパスワードが正しくありません');
    
    // URLの変更 または エラーメッセージの出現を待つ
    await Promise.race([
      page.waitForURL('**/', { timeout: 3000 }),
      errorMsg.waitFor({ state: 'visible', timeout: 3000 })
    ]).catch(() => {});

    // もしログインに失敗していたらサインアップを試みる
    if (page.url().includes('error=')) {
      console.log('Login failed. Attempting to create user...');
      await page.goto('/signup');
      await page.fill('input[name="name"]', 'テストユーザー');
      // search_id はユニークである必要があるのでタイムスタンプを利用
      await page.fill('input[name="search_id"]', `testuser_${Date.now()}`);
      await page.fill('input[name="email"]', email);
      await page.fill('input[name="password"]', password);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/', { timeout: 10000 });
      console.log('User created successfully.');
    } else {
      await page.waitForURL('**/', { timeout: 5000 }).catch(() => {});
    }
    
    // Cookie / LocalStorage を保存
    await page.context().storageState({ path: 'e2e/.auth/user.json' });
    console.log('✅ Global Setup: Logged in and saved state to e2e/.auth/user.json');
  } catch (error) {
    console.error('❌ Global Setup Failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
