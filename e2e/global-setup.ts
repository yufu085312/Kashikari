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
    await page.waitForLoadState('networkidle');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    try {
      await page.click('button[type="submit"]', { force: true });
    } catch (e) {
      const errorContent = await page.evaluate(() => {
        const portal = document.querySelector('nextjs-portal');
        return portal ? portal.shadowRoot?.innerHTML || "Portal found but no shadowRoot" : "No portal found";
      });
      console.error("Next.js Error Overlay Content:", errorContent);
      throw e;
    }

    // エラーメッセージが出たら新規登録にフォールバック
    const errorMsg = page.getByText('メールアドレスまたはパスワードが正しくありません');
    
    // URLの変更 または エラーメッセージの出現を待つ
    await Promise.race([
      page.waitForURL('**/', { timeout: 5000 }),
      errorMsg.waitFor({ state: 'visible', timeout: 5000 })
    ]).catch(() => {});

    // もしログインに失敗していたらサインアップを試みる
    if (page.url().includes('error=') || !page.url().endsWith('/')) {
      const currentUrl = page.url();
      console.log(`Login failed (Current URL: ${currentUrl}). Attempting to create user...`);
      
      await page.goto('/signup');
      await page.fill('input[name="name"]', 'テストユーザー');
      // search_id はユニークである必要があるのでタイムスタンプを利用
      await page.fill('input[name="search_id"]', `testuser_${Date.now()}`);
      await page.fill('input[name="email"]', email);
      await page.fill('input[name="password"]', password);
      await page.click('button[type="submit"]');

      // サインアップ結果を待機
      try {
        await page.waitForURL('**/', { timeout: 10000 });
        console.log('User created successfully.');
      } catch (e) {
        // サインアップに失敗した場合、既に登録されているか確認
        if (page.url().includes('error=')) {
          const decodedError = decodeURIComponent(page.url().split('error=')[1].split('&')[0]);
          console.error(`Signup failed with error: ${decodedError}`);
          
          if (decodedError.includes('登録されています')) {
              console.log('User already exists but login failed (possibly password mismatch). Trying fresh user...');
              // 最終手段として、タイムスタンプ付きの新しいメールアドレスでユーザーを作成して続行する
              const freshEmail = `e2e-test-${Date.now()}@example.com`;
              console.log(`Creating fresh user with email: ${freshEmail}`);
              await page.goto('/signup');
              await page.fill('input[name="name"]', 'テストユーザー');
              await page.fill('input[name="search_id"]', `testuser_${Date.now()}`);
              await page.fill('input[name="email"]', freshEmail);
              await page.fill('input[name="password"]', password);
              await page.click('button[type="submit"]');
              await page.waitForURL('**/', { timeout: 15000 });
              console.log('Fresh user created successfully.');
          } else {
            throw new Error(`Signup failed: ${decodedError}`);
          }
        } else {
          throw e;
        }
      }
    } else {
      console.log('Login successful.');
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
