export type CategoryType = 'income' | 'expense'

export type Category = {
  categoryType: CategoryType
  createdAt: Date
  id: string
  name: string
  userId: string
}

export type CategorySystemDefaults = {
  categoryType: CategoryType
  name: string
  systemKey?: string
}

export type CategorySystemDefaultsInput = {
  userId: string
  categories: ReadonlyArray<CategorySystemDefaults>
}

export type CreateCategoryInput = Pick<Category, 'userId' | 'name' | 'categoryType'>

export type CreateManyCategoriesInput = {
  userId: string
  categories: ReadonlyArray<Pick<Category, 'name' | 'categoryType'>>
}

export type UpdateCategoryInput = Pick<Category, 'id' | 'userId' | 'name' | 'categoryType'>

export type FindCategoryByIdInput = Pick<Category, 'id' | 'userId'>

export type FindCategoryByTypeInput = Pick<Category, 'userId' | 'categoryType'>

export type FindCategoryByNameAndTypeInput = Pick<Category, 'userId' | 'name' | 'categoryType'>

export type FindAllCategoriesInput = Pick<Category, 'userId'>

export type DeleteCategoryInput = Pick<Category, 'id' | 'userId'>

export type DeletedCategory = Pick<Category, 'id'>
