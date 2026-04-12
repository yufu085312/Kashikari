-- ==========================================
-- Update handle_new_user for OAuth support
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  base_name text;
  base_search_id text;
BEGIN
  -- name の決定: raw_user_meta_data->>'name' (アプリ独自の登録) があれば採用、無ければ '未設定'
  base_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    '未設定'
  );

  -- search_id の決定: raw_user_meta_data->>'search_id' があれば利用、無ければ uuid の先頭8桁を仮IDとする
  base_search_id := COALESCE(
    NEW.raw_user_meta_data->>'search_id',
    substr(NEW.id::text, 1, 8)
  );

  -- 念の為、もし uuid の被り等で search_id が重複したらエラーになる（テーブル制約）
  -- 衝突を極力避けるための簡易処理

  INSERT INTO public.users (id, name, search_id, email)
  VALUES (
    NEW.id,
    base_name,
    base_search_id,
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
