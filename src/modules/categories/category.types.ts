export interface Category {
  id: string
  userId: string
  name: string
  createdAt: Date
}

export interface CreateCategory {
  userId: string
  name: string
}

export interface FindCategoryById {
  id: string
  userId: string
}

export interface FindCategoryByName {
  userId: string
  name: string
}

export interface FindAllCategoryByUserId {
  userId: string
}

export interface UpdateCategory {
  id: string
  userId: string
  name: string
}

export interface DeleteCategory {
  id: string
  userId: string
}
