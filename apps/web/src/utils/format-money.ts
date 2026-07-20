import { DEFAULT_USER_CURRENCY, DEFAULT_USER_LOCALE } from '@expense-tracker/contracts'

export function formatMoney(cents: number, currency?: string, locale?: string): string {
  try {
    return new Intl.NumberFormat(locale ?? DEFAULT_USER_LOCALE, {
      style: 'currency',
      currency: currency ?? DEFAULT_USER_CURRENCY,
    }).format(cents / 100)
  } catch {
    return new Intl.NumberFormat(DEFAULT_USER_LOCALE, {
      style: 'currency',
      currency: DEFAULT_USER_CURRENCY,
    }).format(cents / 100)
  }
}
