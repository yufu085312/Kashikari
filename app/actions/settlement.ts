"use server";

import { createClient } from "@/utils/supabase/server";
import { settleDebt } from "@/lib/usecases/settleDebt";
import { deleteSettlement } from "@/lib/repositories/settlementRepository";
import { MESSAGES } from "@/lib/constants";
import {
  createSettlementSchema,
  CreateSettlementSchemaInput,
} from "@/lib/schemas/settlement";
import { revalidatePath } from "next/cache";

/** 精算作成アクション */
export async function createSettlementAction(
  input: CreateSettlementSchemaInput,
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error(MESSAGES.ERROR.UNAUTHORIZED);

    const parsed = createSettlementSchema.parse(input);

    const settlement = await settleDebt({
      groupId: parsed.groupId,
      fromUserId: parsed.fromUserId,
      toUserId: parsed.toUserId,
      amount: parsed.amount,
    });

    revalidatePath(`/groups/${parsed.groupId}`);
    return { data: settlement, error: null };
  } catch (error) {
    console.error("createSettlementAction error:", error);
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "精算の登録に失敗しました",
    };
  }
}

/** 精算削除アクション */
export async function deleteSettlementAction(
  settlementId: string,
  groupId: string,
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error(MESSAGES.ERROR.UNAUTHORIZED);

    await deleteSettlement(settlementId);

    revalidatePath(`/groups/${groupId}`);
    return { data: { success: true }, error: null };
  } catch (error) {
    console.error("deleteSettlementAction error:", error);
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "精算履歴の削除に失敗しました",
    };
  }
}
