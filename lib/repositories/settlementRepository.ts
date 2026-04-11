import { createClient } from "@/utils/supabase/server";
import { Settlement, CreateSettlementInput } from "@/types/balance";
import { NotFoundError, DatabaseError } from "@/lib/errors";
import { MESSAGES } from "@/lib/constants";

export async function insertSettlement(
  input: CreateSettlementInput,
): Promise<Settlement> {
  const supabase = await createClient();
  const { groupId, fromUserId, toUserId, amount } = input;

  const { data, error } = await supabase
    .from("settlements")
    .insert({
      group_id: groupId,
      from_user_id: fromUserId,
      to_user_id: toUserId,
      amount,
    })
    .select()
    .single();

  if (error) throw new DatabaseError(error.message);
  return data;
}

export async function getSettlementsByGroupId(
  groupId: string,
): Promise<Settlement[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("settlements")
    .select(
      `
      *,
      from_user:users!from_user_id(*),
      to_user:users!to_user_id(*)
    `,
    )
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });

  if (error) throw new DatabaseError(error.message);
  return data || [];
}

/**
 * 精算が属するグループIDを取得する。
 * 精算が見つからない場合は NotFoundError を投げる。
 */
export async function getSettlementGroupId(
  settlementId: string,
): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("settlements")
    .select("group_id")
    .eq("id", settlementId)
    .single();

  if (error || !data) {
    throw new NotFoundError(MESSAGES.ERROR.SETTLEMENT_NOT_FOUND);
  }
  return data.group_id;
}

export async function deleteSettlement(settlementId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("settlements")
    .delete()
    .eq("id", settlementId);

  if (error) throw new DatabaseError(error.message);
}
