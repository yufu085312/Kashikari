-- payment_participants テーブルの share_amount の破損データ修復
UPDATE public.payment_participants
SET share_amount = 0
WHERE share_amount IS NULL OR share_amount < 0;

-- share_amount に NOT NULL 制約を追加
ALTER TABLE public.payment_participants
  ALTER COLUMN share_amount SET NOT NULL;

-- share_amount が 0 以上であることを保証する CHECK 制約
ALTER TABLE public.payment_participants
  ADD CONSTRAINT payment_participants_share_amount_check 
  CHECK (share_amount >= 0);

-- groups テーブルの name が空文字でないことを保証する CHECK 制約
ALTER TABLE public.groups
  ADD CONSTRAINT groups_name_check 
  CHECK (char_length(trim(name)) > 0);
