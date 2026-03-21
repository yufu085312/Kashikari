import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Supabase クライアントをモック化
vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}));

// groupRepository をモック化
vi.mock("@/lib/repositories/groupRepository", () => ({
  getGroupById: vi.fn(),
  deleteGroup: vi.fn(),
  getGroupsByUserId: vi.fn(),
  createGroup: vi.fn(),
  addMemberToGroup: vi.fn(),
}));

import { createClient } from "@/utils/supabase/server";
import { getGroupById, deleteGroup } from "@/lib/repositories/groupRepository";
import { GET, DELETE } from "@/app/api/v1/groups/[groupId]/route";
import { MESSAGES } from "@/lib/constants";

const mockCreateClient = vi.mocked(createClient);
const mockGetGroupById = vi.mocked(getGroupById);
const mockDeleteGroup = vi.mocked(deleteGroup);

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

function makeParams(groupId: string) {
  return { params: Promise.resolve({ groupId }) };
}

const dummyGroup = {
  id: "g-1",
  name: "テストグループ",
  members: [{ id: "user-1", name: "Aさん" }],
};

describe("GET /api/v1/groups/[groupId]", () => {
  beforeEach(() => vi.resetAllMocks());

  it("未認証の場合、401 を返す", async () => {
    mockCreateClient.mockResolvedValue(makeUnauthenticatedSupabase() as never);
    const req = new NextRequest("http://localhost/api/v1/groups/g-1");
    const res = await GET(req, makeParams("g-1"));
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error.message).toBe(MESSAGES.ERROR.UNAUTHORIZED);
  });

  it("メンバーでないユーザーは 403 を返す", async () => {
    mockCreateClient.mockResolvedValue(
      makeAuthenticatedSupabase("user-999") as never,
    );
    mockGetGroupById.mockResolvedValue(dummyGroup as never);

    const req = new NextRequest("http://localhost/api/v1/groups/g-1");
    const res = await GET(req, makeParams("g-1"));
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.error.message).toBe(MESSAGES.ERROR.FORBIDDEN);
  });

  it("メンバーであればグループ情報を返す", async () => {
    mockCreateClient.mockResolvedValue(
      makeAuthenticatedSupabase("user-1") as never,
    );
    mockGetGroupById.mockResolvedValue(dummyGroup as never);

    const req = new NextRequest("http://localhost/api/v1/groups/g-1");
    const res = await GET(req, makeParams("g-1"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.id).toBe("g-1");
    expect(json.data.name).toBe("テストグループ");
  });
});

describe("DELETE /api/v1/groups/[groupId]", () => {
  beforeEach(() => vi.resetAllMocks());

  it("未認証の場合、401 を返す", async () => {
    mockCreateClient.mockResolvedValue(makeUnauthenticatedSupabase() as never);
    const req = new NextRequest("http://localhost/api/v1/groups/g-1", {
      method: "DELETE",
    });
    const res = await DELETE(req, makeParams("g-1"));
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error.message).toBe(MESSAGES.ERROR.UNAUTHORIZED);
  });

  it("メンバーでないユーザーは 403 を返す", async () => {
    mockCreateClient.mockResolvedValue(
      makeAuthenticatedSupabase("user-999") as never,
    );
    mockGetGroupById.mockResolvedValue(dummyGroup as never);

    const req = new NextRequest("http://localhost/api/v1/groups/g-1", {
      method: "DELETE",
    });
    const res = await DELETE(req, makeParams("g-1"));
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.error.message).toBe(MESSAGES.ERROR.GROUP_DELETE_NOT_MEMBER);
  });

  it("メンバーであれば削除に成功する", async () => {
    mockCreateClient.mockResolvedValue(
      makeAuthenticatedSupabase("user-1") as never,
    );
    mockGetGroupById.mockResolvedValue(dummyGroup as never);
    mockDeleteGroup.mockResolvedValue(undefined);

    const req = new NextRequest("http://localhost/api/v1/groups/g-1", {
      method: "DELETE",
    });
    const res = await DELETE(req, makeParams("g-1"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.success).toBe(true);
  });
});
