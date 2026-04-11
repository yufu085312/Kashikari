"use server";

import { createSafeAction } from "@/lib/actions/action-utils";
import { settleDebt } from "@/lib/usecases/settleDebt";
import { deleteSettlement } from "@/lib/repositories/settlementRepository";
import { createSettlementSchema } from "@/lib/schemas/settlement";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/** 精算作成アクション */
export const createSettlementAction = createSafeAction(
  createSettlementSchema,
  async (input) => {
    const settlement = await settleDebt(input);
    revalidatePath(`/groups/${input.groupId}`);
    return settlement;
  },
);

/** 精算削除アクション */
export const deleteSettlementAction = createSafeAction(
  z.object({
    settlementId: z.string().uuid(),
    groupId: z.string().uuid(),
  }),
  async ({ settlementId, groupId }) => {
    await deleteSettlement(settlementId);
    revalidatePath(`/groups/${groupId}`);
    return { success: true };
  },
);
