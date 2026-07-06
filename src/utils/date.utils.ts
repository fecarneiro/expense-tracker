import z from 'zod'

// ── Conversions ──────────────────────────────────
export function monthToStartDate(yearMonth: string) {
  return `${yearMonth}-01`
}

// ── Validations ─────────────────────────────
export function isValidIanaTimeZone(value: string) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: value })
    return true
  } catch {
    return false
  }
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
