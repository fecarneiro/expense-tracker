import { expect, test } from 'vitest'
import { fastTransactionParser } from './fast-transaction.parser.js'

test('parses message without operator as expense and with category', () => {
  const message = '200 food'

  const result = fastTransactionParser(message)

  expect(result).toStrictEqual({
    transactionType: 'expense',
    amountCents: 20000,
    categoryName: 'food',
  })
})

test('parses message with - operator as expense and with category', () => {
  const message = '-200 eating out'

  const result = fastTransactionParser(message)

  expect(result).toStrictEqual({
    transactionType: 'expense',
    amountCents: 20000,
    categoryName: 'eating out',
  })
})

test('parses message with + operator as income and with category', () => {
  const message = '+200 food'

  const result = fastTransactionParser(message)

  expect(result).toStrictEqual({
    transactionType: 'income',
    amountCents: 20000,
    categoryName: 'food',
  })
})
