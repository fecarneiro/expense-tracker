export type CategoryType = 'income' | 'expense'

export interface Category {
  id: string
  userId: string
  name: string
  categoryType: CategoryType
  createdAt: Date
}

export type CreateCategoryInput = Pick<Category, 'userId' | 'name' | 'categoryType'>

export type CreateManyCategoriesInput = {
  userId: string
  categories: ReadonlyArray<Pick<Category, 'name' | 'categoryType'>>
}

export type CreateDefaultCategoriesInput = Pick<Category, 'userId'>

export type UpdateCategoryInput = Pick<Category, 'id' | 'userId' | 'name' | 'categoryType'>

export type FindCategoryByIdInput = Pick<Category, 'id' | 'userId'>

export type FindCategoryByTypeInput = Pick<Category, 'userId' | 'categoryType'>

export type FindCategoryByNameAndTypeInput = Pick<Category, 'userId' | 'name' | 'categoryType'>

export type FindAllCategoriesInput = Pick<Category, 'userId'>

export type DeleteCategoryInput = Pick<Category, 'id' | 'userId'>

export type DeletedCategory = Pick<Category, 'id'>
