/**
 * アプリケーション固有のカスタムエラークラス群
 *
 *
 * HTTPステータスコードと紐付けることで、
 * APIルートのcatch節で適切なレスポンスを自動生成できる。
 */
import { MESSAGES } from "@/lib/constants";

export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

/** 400 — バリデーションエラー */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.name = "ValidationError";
  }
}

/** 401 — 認証エラー */
export class UnauthorizedError extends AppError {
  constructor(message: string = MESSAGES.ERROR.UNAUTHORIZED) {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

/** 403 — 認可エラー */
export class ForbiddenError extends AppError {
  constructor(message: string = MESSAGES.ERROR.FORBIDDEN) {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

/** 404 — リソース不在 */
export class NotFoundError extends AppError {
  constructor(message: string = "リソースが見つかりません") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

/** 409 — 競合 (重複など) */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
    this.name = "ConflictError";
  }
}
