import type { Request, Response } from 'express'
import type { CategoryService } from '../category.service.js'
import {
  categoriesHttpResponseSchema,
  categoryHttpResponseSchema,
  categoryIdParamsSchema,
  createCategoryBodySchema,
  updateCategoryBodySchema,
} from './category.http.dto.js'

export class CategoryHttpController {
  constructor(private readonly categoryService: CategoryService) {}

  async create(req: Request, res: Response) {
    const input = createCategoryBodySchema.parse(req.body)
    const userId = req.auth.userId

    const category = await this.categoryService.create({
      userId,
      name: input.name,
      categoryType: input.categoryType,
    })

    res.status(201).json(categoryHttpResponseSchema.parse(category))
  }

  async update(req: Request, res: Response) {
    const { id } = categoryIdParamsSchema.parse(req.params)
    const input = updateCategoryBodySchema.parse(req.body)
    const userId = req.auth.userId

    const category = await this.categoryService.update({
      id,
      userId,
      name: input.name,
      categoryType: input.categoryType,
    })

    res.status(200).json(categoryHttpResponseSchema.parse(category))
  }

  async findById(req: Request, res: Response) {
    const { id } = categoryIdParamsSchema.parse(req.params)
    const userId = req.auth.userId

    const category = await this.categoryService.findById({
      id,
      userId,
    })

    res.status(200).json(categoryHttpResponseSchema.parse(category))
  }

  async findAll(req: Request, res: Response) {
    const userId = req.auth.userId

    const categories = await this.categoryService.findAll({
      userId,
    })

    res.status(200).json(categoriesHttpResponseSchema.parse(categories))
  }

  async delete(req: Request, res: Response) {
    const { id } = categoryIdParamsSchema.parse(req.params)
    const userId = req.auth.userId

    await this.categoryService.delete({
      id,
      userId,
    })

    res.status(204).send()
  }
}
