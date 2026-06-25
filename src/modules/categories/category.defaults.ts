import type { CreateManyCategoriesInput } from './category.types.js'

export const defaultCategories = [
  { name: 'Salary', categoryType: 'income' },
  { name: 'Freelance', categoryType: 'income' },
  { name: 'Investments', categoryType: 'income' },
  { name: 'Other income', categoryType: 'income' },

  { name: 'Food', categoryType: 'expense' },
  { name: 'Transport', categoryType: 'expense' },
  { name: 'Housing', categoryType: 'expense' },
  { name: 'Health', categoryType: 'expense' },
  { name: 'Education', categoryType: 'expense' },
  { name: 'Entertainment', categoryType: 'expense' },
  { name: 'Shopping', categoryType: 'expense' },
  { name: 'Bills', categoryType: 'expense' },
  { name: 'Other expenses', categoryType: 'expense' },
] as const satisfies CreateManyCategoriesInput['categories']
