import { API_PATHS } from "../constants";

const BASE_URL = API_PATHS.BASE_V1;

interface ApiResponse<T> {
  data: T | null;
  error: { message: string } | null;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const json: ApiResponse<T> = await res.json();

  if (!res.ok || json.error) {
    throw new Error(json.error?.message || "API error");
  }

  return json.data as T;
}

export const api = {
  // Groups
  createGroup: (body: { name: string; memberSearchIds: string[] }) =>
    request<{ id: string; name: string }>("/groups", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getGroups: () => request<{ id: string; name: string }[]>(`/groups`),
  getGroup: (groupId: string) =>
    request<{
      id: string;
      name: string;
      members: { id: string; name: string }[];
    }>(`/groups/${groupId}`),
  addMember: (groupId: string, searchId: string) =>
    request<void>(`/groups/${groupId}/members`, {
      method: "POST",
      body: JSON.stringify({ searchId }),
    }),
  removeMember: (groupId: string, userId: string) =>
    request<void>(`/groups/${groupId}/members/${userId}`, {
      method: "DELETE",
    }),
  deleteGroup: (groupId: string) =>
    request<void>(`/groups/${groupId}`, { method: "DELETE" }),

  // Payments
  createPayment: (body: {
    groupId: string;
    payerId: string;
    amount: number;
    participants: { userId: string; share: number }[];
    memo?: string;
  }) =>
    request<{ id: string }>("/payments", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getPayments: (groupId: string) =>
    request<unknown[]>(`/groups/${groupId}/payments`),
  deletePayment: (paymentId: string) =>
    request<void>(`/payments/${paymentId}`, { method: "DELETE" }),

  // Balances
  getBalances: (groupId: string) =>
    request<
      {
        fromUserId: string;
        toUserId: string;
        amount: number;
        fromUserName?: string;
        toUserName?: string;
      }[]
    >(`/groups/${groupId}/balances`),

  // Settlements
  createSettlement: (body: {
    groupId: string;
    fromUserId: string;
    toUserId: string;
    amount: number;
  }) =>
    request<{ id: string }>("/settlements", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getSettlements: (groupId: string) =>
    request<any[]>(`/groups/${groupId}/settlements`),
  deleteSettlement: (settlementId: string) =>
    request<void>(`/settlements/${settlementId}`, { method: "DELETE" }),
};
