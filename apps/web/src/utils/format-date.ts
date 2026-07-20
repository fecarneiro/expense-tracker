import { DEFAULT_USER_LOCALE, DEFAULT_USER_TIME_ZONE } from '@expense-tracker/contracts'

export function formatDate(isoDateTime: string, locale?: string, timeZone?: string): string {
  try {
    return new Intl.DateTimeFormat(locale ?? DEFAULT_USER_LOCALE, {
      day: '2-digit',
      month: '2-digit',
      timeZone: timeZone ?? DEFAULT_USER_TIME_ZONE,
    }).format(new Date(isoDateTime))
  } catch {
    return new Intl.DateTimeFormat(DEFAULT_USER_LOCALE, {
      day: '2-digit',
      month: '2-digit',
      timeZone: DEFAULT_USER_TIME_ZONE,
    }).format(new Date(isoDateTime))
  }
}
