/**
 * Currency formatting utilities.
 * Public pricing is fixed to USD after removing user-facing currency switching.
 */

export const DEFAULT_CURRENCY = "USD" as const;
export type Currency = typeof DEFAULT_CURRENCY;

const DEFAULT_LOCALE = "en-US";
const DEFAULT_SYMBOL = "$";

/**
 * Format a numeric amount as a USD currency string.
 */
export function formatCurrency(
  amount: number,
  currency: Currency = DEFAULT_CURRENCY,
  options?: Intl.NumberFormatOptions,
): string {
  try {
    return new Intl.NumberFormat(DEFAULT_LOCALE, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options,
    }).format(amount);
  } catch {
    return `${DEFAULT_SYMBOL}${amount.toFixed(2)}`;
  }
}

/**
 * Format a compact currency value for summary cards and stats.
 */
export function formatCurrencyCompact(
  amount: number,
  currency: Currency = DEFAULT_CURRENCY,
): string {
  try {
    return new Intl.NumberFormat(DEFAULT_LOCALE, {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  } catch {
    return formatCurrency(amount, currency);
  }
}
