"use server";

import { createSafeAction } from "@/lib/actions/action-utils";
import { createPayment } from "@/lib/usecases/createPayment";
import { deletePayment } from "@/lib/repositories/paymentRepository";
import { createPaymentSchema } from "@/lib/schemas/payment";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/** 支払い作成アクション */
export const createPaymentAction = createSafeAction(
  createPaymentSchema,
  async (input) => {
    const payment = await createPayment(input);
    revalidatePath(`/groups/${input.groupId}`);
    return payment;
  },
);

/** 支払い削除アクション */
export const deletePaymentAction = createSafeAction(
  z.object({
    paymentId: z.string().uuid(),
    groupId: z.string().uuid(),
  }),
  async ({ paymentId, groupId }) => {
    await deletePayment(paymentId);
    revalidatePath(`/groups/${groupId}`);
    return { success: true };
  },
);
