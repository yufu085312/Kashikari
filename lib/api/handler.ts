/**
 * APIルート用の共通ラッパー関数
 *
 * - ok / err ヘルパーの一元管理
 * - 認証チェック（withAuth）の自動化
 * - AppError に応じたHTTPステータスコードの適切な返却
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { AppError } from "@/lib/errors";
import type { User as SupabaseUser } from "@supabase/supabase-js";

/** 成功レスポンス */
export function ok<T>(data: T) {
  return NextResponse.json({ data, error: null });
}

/** エラーレスポンス */
export function err(message: string, status = 400) {
  return NextResponse.json({ data: null, error: { message } }, { status });
}

/**
 * エラーオブジェクトから適切なレスポンスを生成する
 */
export function handleError(e: unknown): NextResponse {
  if (e instanceof AppError) {
    return err(e.message, e.statusCode);
  }
  const message = e instanceof Error ? e.message : String(e);
  return err(message, 500);
}

/**
 * 認証が必要なAPIルートのラッパー
 *
 * @example
 * export const GET = withAuth(async (req, user) => {
 *   const data = await getGroupById(groupId);
 *   return ok(data);
 * });
 */
export function withAuth(
  handler: (req: NextRequest, user: SupabaseUser) => Promise<NextResponse>,
) {
  return async (req: NextRequest, context?: unknown) => {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return err("ログインが必要です", 401);
      }

      return await handler(req, user);
    } catch (e: unknown) {
      return handleError(e);
    }
  };
}

/**
 * 認証 + 動的ルートパラメータ付きのラッパー
 *
 * Next.js App Router の params は Promise なので await して渡す。
 *
 * @example
 * export const GET = withAuthParams<{ groupId: string }>(
 *   async (req, user, params) => {
 *     const group = await getGroupById(params.groupId);
 *     return ok(group);
 *   }
 * );
 */
export function withAuthParams<P extends Record<string, string>>(
  handler: (
    req: NextRequest,
    user: SupabaseUser,
    params: P,
  ) => Promise<NextResponse>,
) {
  return async (req: NextRequest, context: { params: Promise<P> }) => {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return err("ログインが必要です", 401);
      }

      const params = await context.params;
      return await handler(req, user, params);
    } catch (e: unknown) {
      return handleError(e);
    }
  };
}
