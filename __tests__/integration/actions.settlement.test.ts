import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/usecases/settleDebt", () => ({
  settleDebt: vi.fn(),
}));

vi.mock("@/lib/repositories/settlementRepository", () => ({
  deleteSettlement: vi.fn(),
}));

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { settleDebt } from "@/lib/usecases/settleDebt";
import { deleteSettlement } from "@/lib/repositories/settlementRepository";
import {
  createSettlementAction,
  deleteSettlementAction,
} from "@/app/actions/settlement";
import { MESSAGES } from "@/lib/constants";

const mockCreateClient = vi.mocked(createClient);
const mockSettleDebt = vi.mocked(settleDebt);
const mockDeleteSettlement = vi.mocked(deleteSettlement);
const mockRevalidatePath = vi.mocked(revalidatePath);

function makeAuthenticatedSupabase(userId = "user-1") {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
      }),
    },
  };
}

describe("actions/settlement", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("createSettlementAction", () => {
    it("正常に精算を登録し revalidatePath を呼ぶ", async () => {
      mockCreateClient.mockResolvedValue(makeAuthenticatedSupabase() as never);
      const mockResult = { id: "s-1", amount: 500 };
      mockSettleDebt.mockResolvedValue(mockResult as never);

      const input = {
        groupId: "00000000-0000-4000-8000-000000000001",
        fromUserId: "00000000-0000-4000-8000-000000000002",
        toUserId: "00000000-0000-4000-8000-000000000003",
        amount: 500,
      };

      const result = await createSettlementAction(input);

      expect(result.data).toEqual(mockResult);
      expect(mockRevalidatePath).toHaveBeenCalledWith(
        `/groups/${input.groupId}`,
      );
    });
  });

  describe("deleteSettlementAction", () => {
    it("正常に精算を削除し revalidatePath を呼ぶ", async () => {
      mockCreateClient.mockResolvedValue(makeAuthenticatedSupabase() as never);
      mockDeleteSettlement.mockResolvedValue(undefined);

      const result = await deleteSettlementAction("s-1", "g-1");

      expect(result.data?.success).toBe(true);
      expect(mockDeleteSettlement).toHaveBeenCalledWith("s-1");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/groups/g-1");
    });
  });
});
