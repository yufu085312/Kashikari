import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Supabase クライアントをモック化
vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}));

// settleDebt usecase をモック化
vi.mock("@/lib/usecases/settleDebt", () => ({
  settleDebt: vi.fn(),
}));

import { createClient } from "@/utils/supabase/server";
import { settleDebt } from "@/lib/usecases/settleDebt";
import { POST } from "@/app/api/v1/settlements/route";
import { MESSAGES } from "@/lib/constants";

const mockCreateClient = vi.mocked(createClient);
const mockSettleDebt = vi.mocked(settleDebt);

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

function makeUnauthenticatedSupabase() {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error: null,
      }),
    },
  };
}

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/v1/settlements", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/v1/settlements", () => {
  beforeEach(() => vi.resetAllMocks());

  it("未認証の場合、401 を返す", async () => {
    mockCreateClient.mockResolvedValue(makeUnauthenticatedSupabase() as never);
    const req = makeRequest({
      groupId: "g-1",
      fromUserId: "u-1",
      toUserId: "u-2",
      amount: 500,
    });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error.message).toBe(MESSAGES.ERROR.UNAUTHORIZED);
  });

  it("必須パラメータが不足している場合、400 を返す", async () => {
    mockCreateClient.mockResolvedValue(makeAuthenticatedSupabase() as never);

    // groupId のみで fromUserId などが欠如
    const req = makeRequest({ groupId: "g-1" });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error.message).toContain("required");
  });

  it("正常なリクエストの場合、精算結果を返す", async () => {
    mockCreateClient.mockResolvedValue(makeAuthenticatedSupabase() as never);
    const mockSettlement = {
      id: "s-1",
      group_id: "g-1",
      from_user_id: "u-1",
      to_user_id: "u-2",
      amount: 500,
      created_at: "2024-01-01T00:00:00",
    };
    mockSettleDebt.mockResolvedValue(mockSettlement as never);

    const req = makeRequest({
      groupId: "g-1",
      fromUserId: "u-1",
      toUserId: "u-2",
      amount: 500,
    });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.amount).toBe(500);
    expect(json.error).toBeNull();
  });

  it("settleDebt が例外を投げた場合、500 を返す", async () => {
    mockCreateClient.mockResolvedValue(makeAuthenticatedSupabase() as never);
    mockSettleDebt.mockRejectedValue(new Error("DB error"));

    const req = makeRequest({
      groupId: "g-1",
      fromUserId: "u-1",
      toUserId: "u-2",
      amount: 500,
    });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error.message).toBe("DB error");
  });
});
