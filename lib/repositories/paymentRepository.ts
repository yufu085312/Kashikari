import { createClient } from "@/utils/supabase/server";
import { Payment, CreatePaymentInput } from "@/types/payment";
import { NotFoundError, DatabaseError } from "@/lib/errors";

export async function insertPayment(
  input: CreatePaymentInput,
): Promise<Payment> {
  const supabase = await createClient();
  const { groupId, payerId, amount, participants, memo } = input;

  // payments テーブルに挿入
  const { data: payment, error } = await supabase
    .from("payments")
    .insert({
      group_id: groupId,
      payer_id: payerId,
      amount,
      memo,
    })
    .select()
    .single();

  if (error) throw new DatabaseError(error.message);

  // payment_participants テーブルに挿入
  const participantRows = participants.map((p) => ({
    payment_id: payment.id,
    user_id: p.userId,
    share_amount: p.share,
  }));

  const { error: partError } = await supabase
    .from("payment_participants")
    .insert(participantRows);

  if (partError) throw new DatabaseError(partError.message);

  return payment;
}

export async function getPaymentsByGroupId(
  groupId: string,
): Promise<Payment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select(
      `
      *,
      payer:users(*),
      participants:payment_participants(*, user:users(*))
    `,
    )
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });

  if (error) throw new DatabaseError(error.message);
  return data || [];
}

/**
 * 支払いが属するグループIDを取得する。
 * 支払いが見つからない場合は NotFoundError を投げる。
 */
export async function getPaymentGroupId(paymentId: string): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("group_id")
    .eq("id", paymentId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Payment not found");
  }
  return data.group_id;
}

export async function deletePayment(paymentId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("payments")
    .delete()
    .eq("id", paymentId);

  if (error) throw new DatabaseError(error.message);
}
