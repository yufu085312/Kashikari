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

// メンバーシップ検証をモック化
vi.mock("@/lib/api/withGroupMembership", () => ({
  verifyGroupMembership: vi.fn().mockResolvedValue(undefined),
}));

import { createClient } from "@/utils/supabase/server";
import { settleDebt } from "@/lib/usecases/settleDebt";
import { POST } from "@/app/api/v1/settlements/route";
import { MESSAGES } from "@/lib/constants";

const mockCreateClient = vi.mocked(createClient);
const mockSettleDebt = vi.mocked(settleDebt);

// テスト用の有効な UUID
const GROUP_ID = "00000000-0000-4000-8000-000000000001";
const USER_ID_1 = "00000000-0000-4000-8000-000000000010";
const USER_ID_2 = "00000000-0000-4000-8000-000000000020";

function makeAuthenticatedSupabase(userId = USER_ID_1) {
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
      groupId: GROUP_ID,
      fromUserId: USER_ID_1,
      toUserId: USER_ID_2,
      amount: 500,
    });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error.message).toBe("ログインが必要です");
  });

  it("必須パラメータが不足している場合、400 を返す", async () => {
    mockCreateClient.mockResolvedValue(makeAuthenticatedSupabase() as never);

    // groupId のみで fromUserId などが欠如
    const req = makeRequest({ groupId: GROUP_ID });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error.message).toBeTruthy();
  });

  it("正常なリクエストの場合、精算結果を返す", async () => {
    mockCreateClient.mockResolvedValue(makeAuthenticatedSupabase() as never);
    const mockSettlement = {
      id: "00000000-0000-4000-8000-000000000099",
      group_id: GROUP_ID,
      from_user_id: USER_ID_1,
      to_user_id: USER_ID_2,
      amount: 500,
      created_at: "2024-01-01T00:00:00",
    };
    mockSettleDebt.mockResolvedValue(mockSettlement as never);

    const req = makeRequest({
      groupId: GROUP_ID,
      fromUserId: USER_ID_1,
      toUserId: USER_ID_2,
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
      groupId: GROUP_ID,
      fromUserId: USER_ID_1,
      toUserId: USER_ID_2,
      amount: 500,
    });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error.message).toBe("DB error");
  });
});
