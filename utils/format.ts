/**
 * 金額を日本円フォーマットで表示
 * 例: 1200 → "¥1,200"
 */
export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}

/**
 * 日付を日本語フォーマットで表示
 * 例: "2024-01-15T12:00:00" → "2024/01/15"
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * 均等割り計算
 * 端数は最後の人に割り振る
 */
export function calcEvenSplit(
  amount: number,
  participantIds: string[],
): { userId: string; share: number }[] {
  const count = participantIds.length;
  if (count === 0) return [];

  const base = Math.floor(amount / count);
  const remainder = amount - base * count;

  return participantIds.map((userId, index) => ({
    userId,
    share: index === count - 1 ? base + remainder : base,
  }));
}
