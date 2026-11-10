export type TransactionRangeFilter = {
  from: string
  until: string
}

function zonedParts(timestamp: number, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }).formatToParts(timestamp)

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value)

  return {
    year: value('year'),
    month: value('month'),
    day: value('day'),
    hour: value('hour'),
    minute: value('minute'),
    second: value('second'),
  }
}

function zoneOffsetMs(timestamp: number, timeZone: string) {
  const { year, month, day, hour, minute, second } = zonedParts(timestamp, timeZone)
  return Date.UTC(year, month - 1, day, hour, minute, second) - Math.floor(timestamp / 1000) * 1000
}

// The offset is checked twice because it may change between the guess and the real instant (DST).
function startOfMonthInstant(year: number, monthIndex: number, timeZone: string) {
  const wallClock = Date.UTC(year, monthIndex, 1)
  const guess = wallClock - zoneOffsetMs(wallClock, timeZone)
  return new Date(wallClock - zoneOffsetMs(guess, timeZone))
}

function parseMonth(month: string) {
  const [year = 0, monthNumber = 1] = month.split('-').map(Number)
  return { year, monthIndex: monthNumber - 1 }
}

export function currentMonth(now: Date, timeZone: string): string {
  const { year, month } = zonedParts(now.getTime(), timeZone)
  return `${year}-${String(month).padStart(2, '0')}`
}

export function addMonths(month: string, amount: number): string {
  const { year, monthIndex } = parseMonth(month)
  const date = new Date(Date.UTC(year, monthIndex + amount, 1))
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

export function monthRange(month: string, timeZone: string): TransactionRangeFilter {
  const { year, monthIndex } = parseMonth(month)

  return {
    from: startOfMonthInstant(year, monthIndex, timeZone).toISOString(),
    until: startOfMonthInstant(year, monthIndex + 1, timeZone).toISOString(),
  }
}
