export type SharedCategory = {
  id: string
  partnershipId: string
  name: string
  createdAt: Date
}

export type SharedCategoryMapping = {
  id: string
  userId: string
  userCategoryId: string
  sharedCategoryId: string
  createdAt: Date
}

export type CreateSharedCategoryMapping = {
  userId: string
  partnershipId: string
  userCategoryId: string
  sharedCategoryId: string
}
