export type Partnership = {
  id: string
  userAId: string
  userBId: string
  endedAt: Date | null
  createdAt: Date
}

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
}
