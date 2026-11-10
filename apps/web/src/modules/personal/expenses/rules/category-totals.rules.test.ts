import type { ExpenseCategoryTotal } from '@expense-tracker/contracts'
import { describe, expect, it } from 'vitest'
import {
  categoryShareLabel,
  summarizeCategoryTotals,
  VISIBLE_CATEGORIES,
} from './category-totals.rules'

function totals(cents: number[]): ExpenseCategoryTotal[] {
  return cents.map((totalCents, index) => ({
    categoryId: `00000000-0000-4000-8000-00000000000${index}`,
    categoryName: `Category ${index}`,
    totalCents,
  }))
}

describe('categoryShareLabel', () => {
  it('rounds to a whole percentage', () => {
    expect(categoryShareLabel(198595, 816100)).toBe('24%')
    expect(categoryShareLabel(1000, 1000)).toBe('100%')
  })

  it('does not show a small expense as zero', () => {
    expect(categoryShareLabel(1, 1000)).toBe('<1%')
  })
})

describe('summarizeCategoryTotals', () => {
  const seven = totals([700, 600, 500, 400, 300, 200, 100])

  it('shows only the largest categories while collapsed', () => {
    const summary = summarizeCategoryTotals(seven, false)

    expect(summary.rows).toHaveLength(VISIBLE_CATEGORIES)
    expect(summary).toMatchObject({
      totalCents: 2800,
      largestCents: 700,
      hiddenCount: 2,
      hiddenCents: 300,
    })
  })

  it('shows every category while expanded', () => {
    expect(summarizeCategoryTotals(seven, true).rows).toHaveLength(7)
  })

  it('has nothing hidden with few categories', () => {
    expect(summarizeCategoryTotals(totals([300, 200]), false)).toMatchObject({
      hiddenCount: 0,
      hiddenCents: 0,
    })
  })

  it('handles a month without expenses', () => {
    expect(summarizeCategoryTotals([], false)).toEqual({
      rows: [],
      totalCents: 0,
      largestCents: 0,
      hiddenCount: 0,
      hiddenCents: 0,
    })
  })
})
