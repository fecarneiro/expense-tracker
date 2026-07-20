import type { CategorySystemKey } from './category.defaults.js'

export type CategoryType = 'income' | 'expense'

/** Public domain category — never includes `systemKey`. */
export type Category = {
  categoryType: CategoryType
  createdAt: Date
  id: string
  name: string
  userId: string
}

export type CreateCategoryInput = Pick<Category, 'userId' | 'name' | 'categoryType'>

export type UpdateCategoryInput = Pick<Category, 'id' | 'userId' | 'name' | 'categoryType'>

export type FindCategoryByIdInput = Pick<Category, 'id' | 'userId'>

export type FindCategoryByTypeInput = Pick<Category, 'userId' | 'categoryType'>

export type FindCategoryByNameAndTypeInput = Pick<Category, 'userId' | 'name' | 'categoryType'>

export type FindCategoryBySystemKeyInput = {
  userId: string
  systemKey: CategorySystemKey
}

export type FindAllCategoriesInput = Pick<Category, 'userId'>

export type DeleteCategoryInput = Pick<Category, 'id' | 'userId'>

export type DeletedCategory = Pick<Category, 'id'>
