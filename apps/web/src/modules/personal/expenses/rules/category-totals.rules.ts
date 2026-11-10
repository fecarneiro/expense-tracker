import type { ExpenseCategoryTotal } from '@expense-tracker/contracts'

export const VISIBLE_CATEGORIES = 5

export function categoryShareLabel(cents: number, totalCents: number): string {
  const share = (cents / totalCents) * 100
  return share > 0 && share < 1 ? '<1%' : `${Math.round(share)}%`
}

export function summarizeCategoryTotals(totals: ExpenseCategoryTotal[], expanded: boolean) {
  const hidden = totals.slice(VISIBLE_CATEGORIES)
  const sum = (items: ExpenseCategoryTotal[]) =>
    items.reduce((total, { totalCents }) => total + totalCents, 0)

  return {
    rows: expanded ? totals : totals.slice(0, VISIBLE_CATEGORIES),
    totalCents: sum(totals),
    largestCents: totals[0]?.totalCents ?? 0,
    hiddenCount: hidden.length,
    hiddenCents: sum(hidden),
  }
}
