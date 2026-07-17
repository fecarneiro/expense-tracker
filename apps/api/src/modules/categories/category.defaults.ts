import type { CategoryType } from './category.types.js'

export const CATEGORY_SYSTEM_KEY = {
  UNCATEGORIZED: 'uncategorized',
} as const

export type CategorySystemKey = (typeof CATEGORY_SYSTEM_KEY)[keyof typeof CATEGORY_SYSTEM_KEY]

/** Seed-only shape. `systemKey` must not appear on public Category / create / update inputs. */
export type CategorySystemDefault = {
  name: string
  categoryType: CategoryType
  systemKey?: CategorySystemKey
}

/** Internal to repository `createSystemDefaults` + seed. Not part of the service public API. */
export type CategorySystemDefaultsInput = {
  userId: string
  categories: ReadonlyArray<CategorySystemDefault>
}

export const defaultCategories = [
  // Income
  { name: 'Salary', categoryType: 'income' },
  { name: 'Freelance', categoryType: 'income' },
  { name: 'Investments', categoryType: 'income' },
  { name: 'Other', categoryType: 'income' },

  // Expenses
  { name: 'Groceries', categoryType: 'expense' },
  { name: 'Eating Out', categoryType: 'expense' },
  { name: 'Transport', categoryType: 'expense' },
  { name: 'Housing', categoryType: 'expense' },
  { name: 'Healthcare', categoryType: 'expense' },
  { name: 'Entertainment', categoryType: 'expense' },
  { name: 'Shopping', categoryType: 'expense' },
  { name: 'Subscriptions', categoryType: 'expense' },
  { name: 'Travel', categoryType: 'expense' },
  { name: 'Bills', categoryType: 'expense' },
  { name: 'Savings', categoryType: 'expense' },
  { name: 'Other', categoryType: 'expense' },
  { name: 'Uncategorized', categoryType: 'expense', systemKey: CATEGORY_SYSTEM_KEY.UNCATEGORIZED },
] as const satisfies ReadonlyArray<CategorySystemDefault>
