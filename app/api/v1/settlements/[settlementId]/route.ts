export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  deleteSettlement,
  getSettlementsByGroupId,
} from "@/lib/repositories/settlementRepository";
import { MESSAGES } from "@/lib/constants";

function ok<T>(data: T) {
  return NextResponse.json({ data, error: null });
}
function err(message: string, status = 400) {
  return NextResponse.json({ data: null, error: { message } }, { status });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ settlementId: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return err(MESSAGES.ERROR.UNAUTHORIZED, 401);

    const { settlementId } = await params;
    if (!settlementId) return err("settlementId is required");

    // 権限チェック: 精算が属するグループのメンバーかどうか
    const { data: settlement, error: fetchError } = await supabase
      .from("settlements")
      .select("group_id")
      .eq("id", settlementId)
      .single();

    if (fetchError || !settlement)
      return err(MESSAGES.ERROR.SETTLEMENT_NOT_FOUND, 404);

    const { data: membership, error: memberError } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", settlement.group_id)
      .eq("user_id", user.id)
      .single();

    if (memberError || !membership) return err(MESSAGES.ERROR.FORBIDDEN, 403);

    // 削除実行
    await deleteSettlement(settlementId);

    return ok({ success: true });
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    return err(errorMsg, 500);
  }
}
