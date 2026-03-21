export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { createPayment } from "@/lib/usecases/createPayment";
import { createClient } from "@/utils/supabase/server";
import { MESSAGES, LIMITS } from "@/lib/constants";

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
    if (!user) return err(MESSAGES.ERROR.UNAUTHORIZED, 401);

    const body = await req.json();
    const { groupId, payerId, amount, participants, memo } = body;

    if (!groupId || !payerId || !amount || !participants) {
      return err("groupId, payerId, amount, participants are required");
    }
    if (Number(amount) < LIMITS.MIN_PAYMENT_AMOUNT) {
      return err(MESSAGES.ERROR.PAYMENT_AMOUNT_MIN);
    }
    if (Number(amount) > LIMITS.MAX_PAYMENT_AMOUNT) {
      return err(MESSAGES.ERROR.PAYMENT_AMOUNT_MAX);
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
