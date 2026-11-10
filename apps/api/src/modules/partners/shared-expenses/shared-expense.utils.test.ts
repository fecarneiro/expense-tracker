import { resolveSplitAmounts, SPLIT_TYPE } from '@expense-tracker/contracts'
import { expect, test } from 'vitest'

test('resolveSplitAmounts FULL assigns full amount to owed', () => {
  expect(resolveSplitAmounts(1000, SPLIT_TYPE.FULL)).toStrictEqual({
    payerAmountCents: 0,
    owedAmountCents: 1000,
  })
})

test('resolveSplitAmounts HALF splits even total evenly', () => {
  expect(resolveSplitAmounts(1000, SPLIT_TYPE.HALF)).toStrictEqual({
    payerAmountCents: 500,
    owedAmountCents: 500,
  })
})

test('resolveSplitAmounts HALF gives remainder cent to payer on odd total', () => {
  expect(resolveSplitAmounts(1001, SPLIT_TYPE.HALF)).toStrictEqual({
    payerAmountCents: 501,
    owedAmountCents: 500,
  })
})
