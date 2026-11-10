import {
  type CreateSharedExpenseRequest,
  resolveSplitAmounts,
  type SharedCategory,
  SPLIT_TYPE,
  type SplitType,
  TRANSACTION_DESCRIPTION_MAX_LENGTH,
} from '@expense-tracker/contracts'

export type DraftField = 'amount' | 'sharedCategoryId' | 'description'

export type DraftErrors = Partial<Record<DraftField, string>>

export type SharedExpenseDraft = {
  clientId: string
  amount: string
  sharedCategoryId: string
  split: SplitType
  description: string
  errors: DraftErrors
}

export function createDraft(split: SplitType = SPLIT_TYPE.FULL): SharedExpenseDraft {
  return {
    clientId: crypto.randomUUID(),
    amount: '',
    sharedCategoryId: '',
    split,
    description: '',
    errors: {},
  }
}

export function updateDraftField(
  draft: SharedExpenseDraft,
  field: DraftField,
  value: string,
): SharedExpenseDraft {
  const { [field]: _fixed, ...errors } = draft.errors

  return { ...draft, [field]: value, errors }
}

export function parseAmountCents(value: string): number | null {
  const match = value.trim().match(/^(\d+)(?:[.,](\d{1,2}))?$/)
  if (!match) return null

  const [, whole, decimals = ''] = match
  const cents = Number(whole) * 100 + Number(decimals.padEnd(2, '0'))
  return Number.isSafeInteger(cents) ? cents : null
}

export function draftAmountCents(draft: SharedExpenseDraft): number {
  return parseAmountCents(draft.amount) ?? 0
}

export function findCategoryByPrefix(categories: SharedCategory[], prefix: string) {
  const search = prefix.toLocaleLowerCase()

  return categories.find((category) => category.name.toLocaleLowerCase().startsWith(search))
}

// Enter always leaves an empty line ready, so a blank draft is not an expense.
export function isBlankDraft({ amount, sharedCategoryId, description }: SharedExpenseDraft) {
  return !amount.trim() && !sharedCategoryId && !description.trim()
}

export function validateDraft(draft: SharedExpenseDraft): DraftErrors {
  const errors: DraftErrors = {}
  const cents = parseAmountCents(draft.amount)

  if (!draft.amount.trim()) {
    errors.amount = 'Enter an amount.'
  } else if (cents == null) {
    errors.amount = 'Invalid amount.'
  } else if (cents === 0) {
    errors.amount = 'Must be above 0.'
  }

  if (!draft.sharedCategoryId) errors.sharedCategoryId = 'Choose a category.'

  if (draft.description.trim().length > TRANSACTION_DESCRIPTION_MAX_LENGTH) {
    errors.description = `Use at most ${TRANSACTION_DESCRIPTION_MAX_LENGTH} characters.`
  }

  return errors
}

function toRequest(draft: SharedExpenseDraft): CreateSharedExpenseRequest {
  const description = draft.description.trim()

  return {
    totalAmountCents: draftAmountCents(draft),
    sharedCategoryId: draft.sharedCategoryId,
    split: draft.split,
    ...(description ? { description } : {}),
  }
}

export function prepareBatch(drafts: SharedExpenseDraft[]): {
  drafts: SharedExpenseDraft[]
  requests: CreateSharedExpenseRequest[] | null
} {
  const filled = drafts.filter((draft) => !isBlankDraft(draft))
  const checked = (filled.length > 0 ? filled : drafts.slice(0, 1)).map((draft) => ({
    ...draft,
    errors: validateDraft(draft),
  }))
  const isValid = checked.every((draft) => Object.keys(draft.errors).length === 0)

  return { drafts: checked, requests: isValid ? checked.map(toRequest) : null }
}

export function summarizeDrafts(drafts: SharedExpenseDraft[]) {
  return {
    count: Math.max(drafts.filter((draft) => !isBlankDraft(draft)).length, 1),
    totalCents: drafts.reduce((total, draft) => total + draftAmountCents(draft), 0),
    partnerOwesCents: drafts.reduce(
      (total, draft) =>
        total + resolveSplitAmounts(draftAmountCents(draft), draft.split).owedAmountCents,
      0,
    ),
  }
}
