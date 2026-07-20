import { SPLIT_TYPE, type SplitType } from './shared-expense.types.js'

export function resolveSplitAmounts(totalAmountCents: number, split: SplitType) {
  if (split === SPLIT_TYPE.FULL) {
    return { payerAmountCents: 0, owedAmountCents: totalAmountCents }
  }

  const owedAmountCents = Math.floor(totalAmountCents / 2)

  return {
    payerAmountCents: totalAmountCents - owedAmountCents,
    owedAmountCents,
  }
}
