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
