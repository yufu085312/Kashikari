import { createClient } from "@/utils/supabase/server";
import { Payment, CreatePaymentInput } from "@/types/payment";

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

  if (error) throw new Error(error.message);

  // payment_participants テーブルに挿入
  const participantRows = participants.map((p) => ({
    payment_id: payment.id,
    user_id: p.userId,
    share_amount: p.share,
  }));

  const { error: partError } = await supabase
    .from("payment_participants")
    .insert(participantRows);

  if (partError) throw new Error(partError.message);

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

  if (error) throw new Error(error.message);
  return data || [];
}

export async function deletePayment(paymentId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("payments")
    .delete()
    .eq("id", paymentId);

  if (error) throw new Error(error.message);
}
