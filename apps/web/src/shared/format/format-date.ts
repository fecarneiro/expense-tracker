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

export function formatMonthYear(month: string, locale?: string): string {
  const [year = 0, monthNumber = 1] = month.split('-').map(Number)
  const date = new Date(Date.UTC(year, monthNumber - 1, 1))
  const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric', timeZone: 'UTC' }

  try {
    return new Intl.DateTimeFormat(locale ?? DEFAULT_USER_LOCALE, options).format(date)
  } catch {
    return new Intl.DateTimeFormat(DEFAULT_USER_LOCALE, options).format(date)
  }
}
