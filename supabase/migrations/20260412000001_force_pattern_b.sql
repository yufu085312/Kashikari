-- ==========================================
-- Force Pattern B for handle_new_user (Fix)
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  base_name text;
  base_search_id text;
BEGIN
  -- 認証プロバイダーの取得 (email, google, apple など)
  DECLARE
    provider text;
  BEGIN
    provider := NEW.raw_app_meta_data->>'provider';

    -- name の決定: 
    -- 1. メール登録 (provider='email') の場合は、ユーザーが入力した 'name' メタデータを採用
    -- 2. それ以外 (OAuth) の場合は、Google等の名前を無視して '未設定' に固定する (パターンB)
    IF provider = 'email' THEN
      base_name := COALESCE(NEW.raw_user_meta_data->>'name', '未設定');
    ELSE
      base_name := '未設定';
    END IF;

    -- search_id の決定: アプリ独自の登録があれば利用、無ければ uuid の先頭8桁を仮IDとする
    base_search_id := COALESCE(
      NEW.raw_user_meta_data->>'search_id',
      substr(NEW.id::text, 1, 8)
    );
  END;

  INSERT INTO public.users (id, name, search_id, email)
  VALUES (
    NEW.id,
    base_name,
    base_search_id,
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    name = EXCLUDED.name,
    search_id = EXCLUDED.search_id,
    email = EXCLUDED.email;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
