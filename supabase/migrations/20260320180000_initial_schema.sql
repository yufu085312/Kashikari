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
-- 7. RLS (Row Level Security) の設定
-- ==========================================

-- すべてのテーブルで RLS を有効化
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

-- users: 認証済みユーザーのみ、他のユーザーを検索・表示可能
CREATE POLICY "Users are viewable by authenticated users" ON public.users
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- groups: 自分がメンバーであるグループのみ閲覧可能
CREATE POLICY "Groups viewable by members" ON public.groups
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.group_members WHERE group_id = id AND user_id = auth.uid()
  ));

CREATE POLICY "Authenticated users can create groups" ON public.groups
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- group_members: 自分が所属しているグループのメンバー情報のみ閲覧可能
CREATE POLICY "Members viewable by fellow members" ON public.group_members
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.group_members AS m WHERE m.group_id = group_id AND m.user_id = auth.uid()
  ));

CREATE POLICY "Authenticated users can join groups" ON public.group_members
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- payments: 自分が所属しているグループの支払いのみ閲覧・作成可能
CREATE POLICY "Payments viewable by members" ON public.payments
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.group_members WHERE group_id = payments.group_id AND user_id = auth.uid()
  ));

CREATE POLICY "Members can create payments" ON public.payments
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.group_members WHERE group_id = payments.group_id AND user_id = auth.uid()
  ));

-- settlements: 自分が所属しているグループの精算のみ閲覧・作成可能
CREATE POLICY "Settlements viewable by members" ON public.settlements
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.group_members WHERE group_id = settlements.group_id AND user_id = auth.uid()
  ));

CREATE POLICY "Members can create settlements" ON public.settlements
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.group_members WHERE group_id = settlements.group_id AND user_id = auth.uid()
  ));
