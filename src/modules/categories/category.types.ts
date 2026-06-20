export type CategoryType = 'income' | 'expense'

export interface Category {
  id: string
  userId: string
  name: string
  categoryType: CategoryType
  createdAt: Date
}

export type CreateCategoryInput = Pick<Category, 'userId' | 'name' | 'categoryType'>

export type UpdateCategoryInput = Pick<Category, 'id' | 'userId' | 'name' | 'categoryType'>

export type FindCategoryByIdInput = Pick<Category, 'id' | 'userId'>

export type FindCategoryByNameInput = Pick<Category, 'userId' | 'name'>

export type FindAllCategoriesInput = Pick<Category, 'userId'>

export type DeleteCategoryInput = Pick<Category, 'id' | 'userId'>

export type DeletedCategory = Pick<Category, 'id'>
