import { createClient } from "@/utils/supabase/server";
import { MESSAGES } from "@/lib/constants";
import { z } from "zod";

/**
 * Next.js のリダイレクトエラーかどうかを安全に判定する
 * Next.js の内部的な実装 (digest) に基づいて判定し、環境に左右されないようにする
 */
function safeIsRedirectError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const err = error as { digest?: unknown };
  return (
    typeof err.digest === "string" && err.digest.startsWith("NEXT_REDIRECT")
  );
}

/**
 * Server Action のレスポンス形式
 */
export type ActionResponse<T> =
  | { data: T; error: null }
  | { data: null; error: string };

/**
 * 認証が必要な Server Action を作成する共通関数
 */
export function createSafeAction<TInput, TOutput>(
  schema: z.Schema<TInput>,
  handler: (data: TInput, userId: string) => Promise<TOutput>,
) {
  return async (input: TInput): Promise<ActionResponse<TOutput>> => {
    try {
      // 1. 認証チェック
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { data: null, error: MESSAGES.ERROR.UNAUTHORIZED };
      }

      // 2. 入力バリデーション
      const parsedData = schema.parse(input);

      // 3. ハンドラー実行
      const result = await handler(parsedData, user.id);

      return { data: result, error: null };
    } catch (error) {
      if (safeIsRedirectError(error)) throw error;

      console.error("SafeAction error:", error);

      if (error instanceof z.ZodError) {
        return {
          data: null,
          error: MESSAGES.ERROR.VALIDATION_ERROR,
        };
      }

      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : MESSAGES.ERROR.UNEXPECTED_SYSTEM_ERROR,
      };
    }
  };
}

/**
 * 認証不要な Server Action を作成する共通関数
 */
export function createPublicAction<TInput, TOutput>(
  schema: z.Schema<TInput>,
  handler: (data: TInput) => Promise<TOutput>,
) {
  return async (input: TInput): Promise<ActionResponse<TOutput>> => {
    try {
      const parsedData = schema.parse(input);
      const result = await handler(parsedData);
      return { data: result, error: null };
    } catch (error) {
      if (safeIsRedirectError(error)) throw error;

      console.error("PublicAction error:", error);

      if (error instanceof z.ZodError) {
        return {
          data: null,
          error: MESSAGES.ERROR.VALIDATION_ERROR,
        };
      }

      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : MESSAGES.ERROR.UNEXPECTED_SYSTEM_ERROR,
      };
    }
  };
}
