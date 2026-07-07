import { describe, expect, test } from 'vitest'
import { toCategoriesResponse, toCategoryResponse } from './category.mapper.js'

describe('toCategoryResponse', () => {
  test('maps persisted row to API response contract', () => {
    const result = toCategoryResponse({
      id: '019e8885-153c-7c82-af4a-28a31559e01e',
      userId: '019e8885-153c-7c82-af4a-28a31559e02e',
      name: 'Food',
      categoryType: 'expense',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    })

    expect(result).toEqual({
      id: '019e8885-153c-7c82-af4a-28a31559e01e',
      name: 'Food',
      categoryType: 'expense',
    })
  })
})

describe('toCategoriesResponse', () => {
  test('maps each category to API response contract', () => {
    const result = toCategoriesResponse([
      {
        id: '019e8885-153c-7c82-af4a-28a31559e01e',
        userId: '019e8885-153c-7c82-af4a-28a31559e02e',
        name: 'Food',
        categoryType: 'expense',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      },
      {
        id: '019e8885-153c-7c82-af4a-28a31559e03e',
        userId: '019e8885-153c-7c82-af4a-28a31559e02e',
        name: 'Salary',
        categoryType: 'income',
        createdAt: new Date('2026-01-02T00:00:00.000Z'),
      },
    ])

    expect(result).toEqual([
      {
        id: '019e8885-153c-7c82-af4a-28a31559e01e',
        name: 'Food',
        categoryType: 'expense',
      },
      {
        id: '019e8885-153c-7c82-af4a-28a31559e03e',
        name: 'Salary',
        categoryType: 'income',
      },
    ])
  })
})
