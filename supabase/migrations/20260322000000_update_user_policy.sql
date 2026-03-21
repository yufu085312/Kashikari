-- public.users テーブルの更新ポリシーを追加
-- 自身の ID と一致するレコードのみ更新を許可する
DROP POLICY IF EXISTS "Users update themselves" ON public.users;
CREATE POLICY "Users update themselves" ON public.users FOR UPDATE USING (id = auth.uid());
