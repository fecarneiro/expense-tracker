import { describe, expect, it } from 'vitest'
import {
  createDraft,
  findCategoryByPrefix,
  isBlankDraft,
  parseAmountCents,
  prepareBatch,
  type SharedExpenseDraft,
  summarizeDrafts,
  updateDraftField,
  validateDraft,
} from './shared-expense.rules'

const CATEGORY_ID = '00000000-0000-4000-8000-000000000001'

function draft(overrides: Partial<SharedExpenseDraft> = {}): SharedExpenseDraft {
  return { ...createDraft(), ...overrides }
}

const validDraft = (overrides: Partial<SharedExpenseDraft> = {}) =>
  draft({ amount: '10', sharedCategoryId: CATEGORY_ID, ...overrides })

describe('parseAmountCents', () => {
  it.each([
    ['12.50', 1250],
    ['12,50', 1250],
    ['12.5', 1250],
    ['12,5', 1250],
    ['12,05', 1205],
    ['12', 1200],
    [' 7,05 ', 705],
    ['0', 0],
  ])('parses %s as %i cents', (value, cents) => {
    expect(parseAmountCents(value)).toBe(cents)
  })

  it.each(['', 'abc', '-5', '12,505', '1.234,50', '1,234.50', '1.234', '99999999999999999'])(
    'rejects %j',
    (value) => {
      expect(parseAmountCents(value)).toBeNull()
    },
  )
})

describe('createDraft', () => {
  it('uses the full split by default and generates distinct ids', () => {
    expect(createDraft().split).toBe('full')
    expect(createDraft().clientId).not.toBe(createDraft().clientId)
  })

  it('accepts the split inherited from the previous line', () => {
    expect(createDraft('half').split).toBe('half')
  })
})

describe('updateDraftField', () => {
  it('sets the value and clears only the error of that field', () => {
    const invalid = draft({
      errors: { amount: 'Enter an amount.', sharedCategoryId: 'Choose a category.' },
    })

    const updated = updateDraftField(invalid, 'amount', '20')

    expect(updated.amount).toBe('20')
    expect(updated.errors).toEqual({ sharedCategoryId: 'Choose a category.' })
  })
})

describe('findCategoryByPrefix', () => {
  const categories = [
    { id: '1', name: 'Eating Out' },
    { id: '2', name: 'Grocery' },
    { id: '3', name: 'Groceries bulk' },
  ]

  it('ignores case and returns the first match', () => {
    expect(findCategoryByPrefix(categories, 'gro')?.id).toBe('2')
  })

  it('matches names with spaces', () => {
    expect(findCategoryByPrefix(categories, 'eating o')?.id).toBe('1')
  })

  it('returns undefined without a match', () => {
    expect(findCategoryByPrefix(categories, 'x')).toBeUndefined()
  })
})

describe('isBlankDraft', () => {
  it('ignores the split, because a new line inherits it', () => {
    expect(isBlankDraft(draft({ split: 'half' }))).toBe(true)
  })

  it.each([{ amount: '10' }, { sharedCategoryId: CATEGORY_ID }, { description: 'Market' }])(
    'is false when %o is filled',
    (overrides) => {
      expect(isBlankDraft(draft(overrides))).toBe(false)
    },
  )

  it('treats whitespace as blank', () => {
    expect(isBlankDraft(draft({ amount: '  ', description: ' ' }))).toBe(true)
  })
})

describe('validateDraft', () => {
  it('accepts a complete draft', () => {
    expect(validateDraft(validDraft())).toEqual({})
  })

  it('reports every problem of the line at once', () => {
    expect(validateDraft(draft())).toEqual({
      amount: 'Enter an amount.',
      sharedCategoryId: 'Choose a category.',
    })
  })

  it('distinguishes an invalid amount from a zero amount', () => {
    expect(validateDraft(validDraft({ amount: '1.234,50' })).amount).toBe('Invalid amount.')
    expect(validateDraft(validDraft({ amount: '0,00' })).amount).toBe('Must be above 0.')
  })

  it('limits the description to 70 characters after trimming', () => {
    expect(validateDraft(validDraft({ description: ` ${'a'.repeat(70)} ` }))).toEqual({})
    expect(validateDraft(validDraft({ description: 'a'.repeat(71) })).description).toBe(
      'Use at most 70 characters.',
    )
  })
})

describe('prepareBatch', () => {
  it('drops blank lines and builds the requests', () => {
    const { drafts, requests } = prepareBatch([
      validDraft({ amount: '12,50', split: 'half', description: ' Market ' }),
      draft(),
    ])

    expect(drafts).toHaveLength(1)
    expect(requests).toEqual([
      {
        totalAmountCents: 1250,
        sharedCategoryId: CATEGORY_ID,
        split: 'half',
        description: 'Market',
      },
    ])
  })

  it('omits an empty description', () => {
    const { requests } = prepareBatch([validDraft({ description: '  ' })])

    expect(requests?.[0]).not.toHaveProperty('description')
  })

  it('marks each invalid line and returns no requests', () => {
    const { drafts, requests } = prepareBatch([
      validDraft(),
      validDraft({ amount: '' }),
      validDraft(),
      validDraft({ sharedCategoryId: '' }),
    ])

    expect(requests).toBeNull()
    expect(drafts.map((item) => item.errors)).toEqual([
      {},
      { amount: 'Enter an amount.' },
      {},
      { sharedCategoryId: 'Choose a category.' },
    ])
  })

  it('keeps one line and reports its errors when everything is blank', () => {
    const { drafts, requests } = prepareBatch([draft(), draft()])

    expect(requests).toBeNull()
    expect(drafts).toHaveLength(1)
    expect(drafts[0]?.errors.amount).toBe('Enter an amount.')
  })
})

describe('summarizeDrafts', () => {
  it('sums what is typed and applies each split', () => {
    const summary = summarizeDrafts([
      validDraft({ amount: '100', split: 'full' }),
      validDraft({ amount: '0,05', split: 'half' }),
      draft(),
    ])

    expect(summary).toEqual({ count: 2, totalCents: 10005, partnerOwesCents: 10002 })
  })

  it('counts one expense when the only line is blank', () => {
    expect(summarizeDrafts([draft()])).toEqual({ count: 1, totalCents: 0, partnerOwesCents: 0 })
  })

  it('ignores invalid amounts', () => {
    expect(summarizeDrafts([draft({ amount: 'abc' })]).totalCents).toBe(0)
  })
})
