-- ==========================================
-- Kashikari Initial Schema (Combined)
-- ==========================================

-- 1. users テーブル (Supabase Auth 連携)
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  search_id text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. groups テーブル
CREATE TABLE public.groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. group_members テーブル
CREATE TABLE public.group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- 4. payments テーブル
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  payer_id uuid REFERENCES users(id),
  amount integer NOT NULL CHECK (amount > 0),
  memo text,
  created_at timestamp with time zone DEFAULT now()
);

-- 5. payment_participants テーブル
CREATE TABLE public.payment_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid REFERENCES payments(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  share_amount integer,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(payment_id, user_id)
);

-- 6. settlements テーブル
CREATE TABLE public.settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  from_user_id uuid REFERENCES users(id),
  to_user_id uuid REFERENCES users(id),
  amount integer NOT NULL CHECK (amount > 0),
  created_at timestamp with time zone DEFAULT now()
);

-- インデックスの作成
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_payments_group_id ON payments(group_id);
CREATE INDEX idx_payment_participants_payment_id ON payment_participants(payment_id);
CREATE INDEX idx_settlements_group_id ON settlements(group_id);

-- Supabase Auth 連携トリガー
-- ユーザー作成時に public.users にも自動登録する
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, search_id, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'search_id',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- 7. RLS (Row Level Security) の設定 (根本対策版)
-- ==========================================

-- 一旦すべてのポリシーと関数をきれいに削除
DROP POLICY IF EXISTS "Users are viewable by authenticated users" ON public.users;
DROP POLICY IF EXISTS "Groups viewable by members" ON public.groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Members viewable by fellow members" ON public.group_members;
DROP POLICY IF EXISTS "Authenticated users can join groups" ON public.group_members;
DROP POLICY IF EXISTS "Payments viewable by members" ON public.payments;
DROP POLICY IF EXISTS "Members can create payments" ON public.payments;
DROP POLICY IF EXISTS "Settlements viewable by members" ON public.settlements;
DROP POLICY IF EXISTS "Members can create settlements" ON public.settlements;
DROP FUNCTION IF EXISTS public.is_group_member;

-- 再帰を使わずに「自分がメンバーであるグループID」を返す関数（SECURITY DEFINER で RLS をバイパス）
CREATE OR REPLACE FUNCTION public.get_my_groups()
RETURNS setof uuid AS $$
  SELECT group_id FROM public.group_members WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- 1. users: 認証済みユーザーなら誰でも見れる（検索用）
CREATE POLICY "Users are viewable by all" ON public.users FOR SELECT USING (auth.uid() IS NOT NULL);

-- 2. groups: 自分が所属しているグループのみ
CREATE POLICY "Groups viewable by members" ON public.groups FOR SELECT USING (id IN (SELECT public.get_my_groups()));
CREATE POLICY "Groups insert by all" ON public.groups FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 3. group_members: 自分が所属しているグループのメンバーのみ
CREATE POLICY "Members viewable by fellow members" ON public.group_members FOR SELECT USING (group_id IN (SELECT public.get_my_groups()));
CREATE POLICY "Members insert by all" ON public.group_members FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 4. payments: 同様
CREATE POLICY "Payments viewable by members" ON public.payments FOR SELECT USING (group_id IN (SELECT public.get_my_groups()));
CREATE POLICY "Payments insert by members" ON public.payments FOR INSERT WITH CHECK (group_id IN (SELECT public.get_my_groups()));

-- 5. settlements: 同様
CREATE POLICY "Settlements viewable by members" ON public.settlements FOR SELECT USING (group_id IN (SELECT public.get_my_groups()));
CREATE POLICY "Settlements insert by members" ON public.settlements FOR INSERT WITH CHECK (group_id IN (SELECT public.get_my_groups()));


