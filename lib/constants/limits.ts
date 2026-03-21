export const LIMITS = {
  MAX_NAME_LENGTH: 20,
  MAX_SEARCH_ID_LENGTH: 20,
  MAX_GROUP_NAME_LENGTH: 20,
  MIN_PASSWORD_LENGTH: 6,
  SEARCH_ID_PATTERN: /^[a-zA-Z0-9_]+$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MIN_PAYMENT_AMOUNT: 1,
  MAX_PAYMENT_AMOUNT: 9999999,
} as const;

export const TIMEOUTS = {
  COPY_FEEDBACK: 2000,
} as const;
