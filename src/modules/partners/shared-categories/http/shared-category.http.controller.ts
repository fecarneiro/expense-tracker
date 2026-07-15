import type { Request, Response } from 'express'
import { ActivePartnershipNotFoundError } from '../../shared-expenses/shared-expense.errors.js'
import { mapUserCategoryToSharedBodySchema } from '../shared-category.schemas.js'
import type { SharedCategoryService } from '../shared-category.service.js'

export class SharedCategoryHttpController {
  constructor(private readonly sharedCategoryService: SharedCategoryService) {}

  async findAll(req: Request, res: Response) {
    if (!req.partnership) throw new ActivePartnershipNotFoundError()

    const sharedCategories = await this.sharedCategoryService.findPartnershipSharedCategories(
      req.partnership.id,
    )
    res.status(200).json(sharedCategories)
  }

  async mapUserCategory(req: Request, res: Response) {
    if (!req.partnership) throw new ActivePartnershipNotFoundError()

    const { userCategoryId, sharedCategoryId } = mapUserCategoryToSharedBodySchema.parse(req.body)

    const mapping = await this.sharedCategoryService.mapUserCategoryToShared({
      userId: req.auth.userId,
      partnershipId: req.partnership.id,
      userCategoryId,
      sharedCategoryId,
    })

    // TODO: remove users ID from response
    res.status(201).json(mapping)
  }
}
