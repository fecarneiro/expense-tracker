import { describe, expect, it } from 'vitest'
import { addMonths, currentMonth, monthRange } from './month.rules'

describe('currentMonth', () => {
  it('uses the month of the time zone, not of UTC', () => {
    const newYearInUtc = new Date('2027-01-01T01:00:00Z')

    expect(currentMonth(newYearInUtc, 'UTC')).toBe('2027-01')
    expect(currentMonth(newYearInUtc, 'America/Sao_Paulo')).toBe('2026-12')
    expect(currentMonth(new Date('2026-11-30T20:00:00Z'), 'Asia/Tokyo')).toBe('2026-12')
  })
})

describe('addMonths', () => {
  it.each([
    ['2026-11', 1, '2026-12'],
    ['2026-12', 1, '2027-01'],
    ['2026-01', -1, '2025-12'],
    ['2026-11', -12, '2025-11'],
  ])('%s plus %i is %s', (month, amount, expected) => {
    expect(addMonths(month, amount)).toBe(expected)
  })
})

describe('monthRange', () => {
  it('starts and ends at midnight of the time zone', () => {
    expect(monthRange('2026-11', 'UTC')).toEqual({
      from: '2026-11-01T00:00:00.000Z',
      until: '2026-12-01T00:00:00.000Z',
    })
    expect(monthRange('2026-11', 'America/Sao_Paulo')).toEqual({
      from: '2026-11-01T03:00:00.000Z',
      until: '2026-12-01T03:00:00.000Z',
    })
    expect(monthRange('2026-11', 'Asia/Tokyo')).toEqual({
      from: '2026-10-31T15:00:00.000Z',
      until: '2026-11-30T15:00:00.000Z',
    })
  })

  it('rolls over to the next year', () => {
    expect(monthRange('2026-12', 'UTC').until).toBe('2027-01-01T00:00:00.000Z')
  })

  it('follows the offset of each end when daylight saving changes inside the month', () => {
    expect(monthRange('2026-03', 'America/New_York')).toEqual({
      from: '2026-03-01T05:00:00.000Z',
      until: '2026-04-01T04:00:00.000Z',
    })
  })
})
