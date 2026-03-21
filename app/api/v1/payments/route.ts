export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { createPayment } from "@/lib/usecases/createPayment";
import { createClient } from "@/utils/supabase/server";

function ok<T>(data: T) {
  return NextResponse.json({ data, error: null });
}
function err(message: string, status = 400) {
  return NextResponse.json({ data: null, error: { message } }, { status });
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return err("Unauthorized", 401);

    const body = await req.json();
    const { groupId, payerId, amount, participants, memo } = body;

    if (!groupId || !payerId || !amount || !participants) {
      return err("groupId, payerId, amount, participants are required");
    }
    if (Number(amount) <= 0) {
      return err("1以上の金額を入力してください");
    }
    if (Number(amount) > 9_999_999) {
      return err("金額は9,999,999円以下で入力してください");
    }

    const payment = await createPayment({
      groupId,
      payerId,
      amount,
      participants,
      memo,
    });
    return ok(payment);
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    return err(errorMsg, 500);
  }
}
