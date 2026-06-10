import z from 'zod'

export const yearMonthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/)

export type YearMonth = z.infer<typeof yearMonthSchema>

export function currentUtcMonth(): YearMonth {
  return new Date().toISOString().slice(0, 7)
}

function addMonthsToYearMonth(yearMonth: YearMonth, amount: number): YearMonth {
  const year = Number(yearMonth.slice(0, 4))
  const month = Number(yearMonth.slice(5, 7))

  // Convert YYYY-MM to a zero-based absolute month index so adding/subtracting
  // months naturally crosses year boundaries. Example: 2026-01 -> 2026 * 12 + 0.
  const absoluteMonthIndex = year * 12 + month - 1 + amount

  const shiftedYear = Math.floor(absoluteMonthIndex / 12)
  const shiftedMonth = (absoluteMonthIndex % 12) + 1

  return `${shiftedYear}-${String(shiftedMonth).padStart(2, '0')}`
}

export function nextMonth(yearMonth: YearMonth): YearMonth {
  return addMonthsToYearMonth(yearMonth, 1)
}

export function subtractMonths(yearMonth: YearMonth, amount: number): YearMonth {
  return addMonthsToYearMonth(yearMonth, -amount)
}

export function monthToStartDate(yearMonth: YearMonth): YearMonth {
  return `${yearMonth}-01`
}
