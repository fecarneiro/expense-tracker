export const SHARED_CATEGORY_DEFAULTS = [
  { name: 'Eating Out' },
  { name: 'Grocery' },
  { name: 'House' },
  { name: 'Other' },
]

const SPLIT_TYPE = {
  HALF: 'half',
  FULL: 'full',
} as const

export type SplitType = (typeof SPLIT_TYPE)[keyof typeof SPLIT_TYPE]
