export interface Category {
  id: string
  userId: string
  name: string
  createdAt: Date
}

export type CreateCategoryInput = Pick<Category, 'userId' | 'name'>

export type UpdateCategoryInput = Pick<Category, 'id' | 'userId' | 'name'>

export type FindCategoryByIdInput = Pick<Category, 'id' | 'userId'>

export type FindCategoryByNameInput = Pick<Category, 'userId' | 'name'>

export type FindAllCategoriesInput = Pick<Category, 'userId'>

export type DeleteCategoryInput = Pick<Category, 'id' | 'userId'>

export type DeletedCategory = Pick<Category, 'id'>
