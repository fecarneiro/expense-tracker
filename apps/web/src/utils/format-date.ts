export function formatDate(isoDateTime: string, locale: string, timeZone: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    timeZone,
  }).format(new Date(isoDateTime))
}
