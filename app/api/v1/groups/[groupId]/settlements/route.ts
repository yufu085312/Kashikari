export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { getSettlementsByGroupId } from "@/lib/repositories/settlementRepository";
import { createClient } from "@/utils/supabase/server";

function ok<T>(data: T) {
  return NextResponse.json({ data, error: null });
}
function err(message: string, status = 400) {
  return NextResponse.json({ data: null, error: { message } }, { status });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return err("Unauthorized", 401);

    const { groupId } = await params;
    const settlements = await getSettlementsByGroupId(groupId);

    return ok(settlements);
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    return err(errorMsg, 500);
  }
}
