"use server";

import { createClient } from "@/utils/supabase/server";
import { createPayment } from "@/lib/usecases/createPayment";
import { deletePayment } from "@/lib/repositories/paymentRepository";
import { MESSAGES } from "@/lib/constants";
import {
  createPaymentSchema,
  CreatePaymentSchemaInput,
} from "@/lib/schemas/payment";
import { revalidatePath } from "next/cache";

/** 支払い作成アクション */
export async function createPaymentAction(input: CreatePaymentSchemaInput) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error(MESSAGES.ERROR.UNAUTHORIZED);

    const parsed = createPaymentSchema.parse(input);

    const payment = await createPayment(parsed);

    revalidatePath(`/groups/${parsed.groupId}`);
    return { data: payment, error: null };
  } catch (error) {
    console.error("createPaymentAction error:", error);
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "支払いの登録に失敗しました",
    };
  }
}

/** 支払い削除アクション */
export async function deletePaymentAction(paymentId: string, groupId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error(MESSAGES.ERROR.UNAUTHORIZED);

    await deletePayment(paymentId);

    revalidatePath(`/groups/${groupId}`);
    return { data: { success: true }, error: null };
  } catch (error) {
    console.error("deletePaymentAction error:", error);
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "支払いの削除に失敗しました",
    };
  }
}
