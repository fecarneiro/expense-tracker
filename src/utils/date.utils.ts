import z from 'zod'

// ── Schemas (YYYY-MM | YYYY-MM-DD) ───────────────
export const yearMonthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/)
export const yearMonthDaySchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/)

// ── Current (UTC) ────────────────────────────────
export function currentUtcMonth() {
  return new Date().toISOString().slice(0, 7)
}

// ── Conversions ──────────────────────────────────
export function monthToStartDate(yearMonth: string) {
  return `${yearMonth}-01`
}

// TODO - Timezone issue
export function isoDateTimeToReadable(isoDateTime: string) {
  const date = new Date(isoDateTime)

  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

// TODO - Timezone issue
export function monthToReadable(yearMonth: string) {
  const date = new Date(`${yearMonth}-01`)

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

export function utcStringToDate(utcString: string) {
  return new Date(utcString) ?? false
}

// ── Month arithmetic ─────────────────────────────
function addMonthsToYearMonth(yearMonth: string, amount: number) {
  const year = Number(yearMonth.slice(0, 4))
  const month = Number(yearMonth.slice(5, 7))

  // Convert YYYY-MM to a zero-based absolute month index so adding/subtracting
  // months naturally crosses year boundaries. Example: 2026-01 -> 2026 * 12 + 0.
  const absoluteMonthIndex = year * 12 + month - 1 + amount

  const shiftedYear = Math.floor(absoluteMonthIndex / 12)
  const shiftedMonth = (absoluteMonthIndex % 12) + 1

  return `${shiftedYear}-${String(shiftedMonth).padStart(2, '0')}`
}

export function nextMonth(yearMonth: string): string {
  return addMonthsToYearMonth(yearMonth, 1)
}

export function subtractMonths(yearMonth: string, amount: number): string {
  return addMonthsToYearMonth(yearMonth, -amount)
}
