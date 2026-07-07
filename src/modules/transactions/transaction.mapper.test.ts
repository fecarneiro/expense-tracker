import { describe, expect, test } from 'vitest'
import { TEST_OCCURRED_AT_DATE, TEST_OCCURRED_AT_RESPONSE } from '../../tests/constants.js'
import { toTransactionResponse } from './transaction.mapper.js'

describe('toTransactionResponse', () => {
  test('maps persisted row to API response contract', () => {
    const result = toTransactionResponse({
      id: '019e8885-153c-7c82-af4a-28a31559e01e',
      userId: '019e8885-153c-7c82-af4a-28a31559e02e',
      createdByUserId: '019e8885-153c-7c82-af4a-28a31559e02e',
      categoryId: '019e8885-153c-7c82-af4a-28a31559e03e',
      occurredAt: TEST_OCCURRED_AT_DATE,
      transactionType: 'expense',
      amountInCents: 1000,
      notes: 'Test transaction',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      category: {
        id: '019e8885-153c-7c82-af4a-28a31559e03e',
        name: 'Eating Out',
      },
    })

    expect(result).toEqual({
      id: '019e8885-153c-7c82-af4a-28a31559e01e',
      occurredAt: TEST_OCCURRED_AT_RESPONSE,
      transactionType: 'expense',
      amountInCents: 1000,
      notes: 'Test transaction',
      category: {
        id: '019e8885-153c-7c82-af4a-28a31559e03e',
        name: 'Eating Out',
      },
    })
  })
})
