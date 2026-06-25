import type { CreateManyCategoriesInput } from './category.types.js'

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
] as const satisfies CreateManyCategoriesInput['categories']
