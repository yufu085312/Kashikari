-- 退会（アカウント削除）時に支払い履歴や精算履歴を保持するため、
-- 外部キー制約を ON DELETE SET NULL に変更します。

ALTER TABLE public.payments
  DROP CONSTRAINT IF EXISTS payments_payer_id_fkey,
  ADD CONSTRAINT payments_payer_id_fkey FOREIGN KEY (payer_id) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.settlements
  DROP CONSTRAINT IF EXISTS settlements_from_user_id_fkey,
  ADD CONSTRAINT settlements_from_user_id_fkey FOREIGN KEY (from_user_id) REFERENCES public.users(id) ON DELETE SET NULL,
  DROP CONSTRAINT IF EXISTS settlements_to_user_id_fkey,
  ADD CONSTRAINT settlements_to_user_id_fkey FOREIGN KEY (to_user_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- 支払い参加者についても、レコードを削除せず user_id を NULL にすることで、
-- 支払い金額の合計（内訳）の整合性を維持します。
ALTER TABLE public.payment_participants
  DROP CONSTRAINT IF EXISTS payment_participants_user_id_fkey,
  ADD CONSTRAINT payment_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;
