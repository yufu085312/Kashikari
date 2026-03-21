import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Supabase クライアントをモック化
vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}));

// createGroup usecase をモック化
vi.mock("@/lib/usecases/createGroup", () => ({
  createGroup: vi.fn(),
}));

// getGroupsByUserId repository をモック化
vi.mock("@/lib/repositories/groupRepository", () => ({
  getGroupsByUserId: vi.fn(),
  getGroupById: vi.fn(),
  deleteGroup: vi.fn(),
}));

import { createClient } from "@/utils/supabase/server";
import { createGroup } from "@/lib/usecases/createGroup";
import { getGroupsByUserId } from "@/lib/repositories/groupRepository";
import { POST, GET } from "@/app/api/v1/groups/route";
import { MESSAGES, LIMITS } from "@/lib/constants";

// モック型アサーション用ヘルパー
const mockCreateClient = vi.mocked(createClient);
const mockCreateGroup = vi.mocked(createGroup);
const mockGetGroupsByUserId = vi.mocked(getGroupsByUserId);

// 認証済みユーザーのモック Supabase クライアント
function makeAuthenticatedSupabase(userId = "user-1") {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: userId, email: "test@example.com" } },
        error: null,
      }),
    },
  };
}

// 未認証のモック Supabase クライアント
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

// テスト用リクエスト生成
function makeRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/v1/groups", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/v1/groups", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("未認証の場合、401 を返す", async () => {
    mockCreateClient.mockResolvedValue(makeUnauthenticatedSupabase() as never);
    const req = makeRequest({ name: "テストグループ" });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error.message).toBe(MESSAGES.ERROR.UNAUTHORIZED);
  });

  it("name が未指定の場合、400 を返す", async () => {
    mockCreateClient.mockResolvedValue(makeAuthenticatedSupabase() as never);
    const req = makeRequest({});
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error.message).toBe(MESSAGES.ERROR.GROUP_NAME_REQUIRED);
  });

  it("グループ名が20文字を超える場合、400 を返す", async () => {
    mockCreateClient.mockResolvedValue(makeAuthenticatedSupabase() as never);
    const req = makeRequest({
      name: "a".repeat(LIMITS.MAX_GROUP_NAME_LENGTH + 1),
    });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error.message).toBe(MESSAGES.ERROR.GROUP_NAME_TOO_LONG);
  });

  it("正常なリクエストの場合、201 相当のデータを返す", async () => {
    mockCreateClient.mockResolvedValue(makeAuthenticatedSupabase() as never);
    const mockGroup = {
      id: "g-1",
      name: "テストグループ",
      userIds: ["user-1"],
    };
    mockCreateGroup.mockResolvedValue(mockGroup as never);

    const req = makeRequest({ name: "テストグループ" });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.name).toBe("テストグループ");
    expect(json.error).toBeNull();
  });
});

describe("GET /api/v1/groups", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("未認証の場合、401 を返す", async () => {
    mockCreateClient.mockResolvedValue(makeUnauthenticatedSupabase() as never);
    const req = new NextRequest("http://localhost/api/v1/groups");
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error.message).toBe(MESSAGES.ERROR.UNAUTHORIZED);
  });

  it("認証済みの場合、グループ一覧を返す", async () => {
    mockCreateClient.mockResolvedValue(makeAuthenticatedSupabase() as never);
    const mockGroups = [{ id: "g-1", name: "グループA" }];
    mockGetGroupsByUserId.mockResolvedValue(mockGroups as never);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toHaveLength(1);
    expect(json.data[0].name).toBe("グループA");
  });
});
