import { describe, it, expect } from "vitest";
import { calcEvenSplit } from "@/utils/format";

describe("calcEvenSplit", () => {
  it("参加者が0人の場合、空配列を返す", () => {
    const result = calcEvenSplit(1000, []);
    expect(result).toEqual([]);
  });

  it("1人の場合、全額がその人に割り当てられる", () => {
    const result = calcEvenSplit(1000, ["userA"]);
    expect(result).toEqual([{ userId: "userA", share: 1000 }]);
  });

  it("端数なしの均等割り", () => {
    const result = calcEvenSplit(900, ["userA", "userB", "userC"]);
    expect(result).toHaveLength(3);
    result.forEach((r) => {
      expect(r.share).toBe(300);
    });
  });

  it("端数ありの場合、最後の人に端数が加算される", () => {
    // 1000 / 3 = 333 余り 1 → 最後の人が 334円
    const result = calcEvenSplit(1000, ["userA", "userB", "userC"]);
    expect(result).toHaveLength(3);
    expect(result[0].share).toBe(333);
    expect(result[1].share).toBe(333);
    expect(result[2].share).toBe(334); // 端数が加算される
  });

  it("合計金額が元の金額と一致する", () => {
    const amount = 1007;
    const ids = ["userA", "userB", "userC"];
    const result = calcEvenSplit(amount, ids);
    const total = result.reduce((sum, r) => sum + r.share, 0);
    expect(total).toBe(amount);
  });
});
