import { describe, it, expect } from "vitest";
import { formatCurrency, formatDate } from "@/utils/format";

describe("formatCurrency", () => {
  it("整数を ¥カンマ区切り 形式に変換する", () => {
    expect(formatCurrency(1200)).toBe("¥1,200");
  });

  it("1000未満の場合はカンマなし", () => {
    expect(formatCurrency(500)).toBe("¥500");
  });

  it("0 の場合", () => {
    expect(formatCurrency(0)).toBe("¥0");
  });

  it("大きな金額もカンマ区切りになる", () => {
    expect(formatCurrency(1000000)).toBe("¥1,000,000");
  });
});

describe("formatDate", () => {
  it("ISO 8601 文字列を yyyy/MM/dd 形式に変換する", () => {
    const result = formatDate("2024-01-15T12:00:00");
    expect(result).toBe("2024/01/15");
  });

  it("月・日が1桁の場合でもゼロ埋めされる", () => {
    const result = formatDate("2024-03-05T00:00:00");
    expect(result).toBe("2024/03/05");
  });
});
