import type { Request, Response } from 'express'
import {
  categoryIdParamsSchema,
  createCategorySchema,
  updateCategorySchema,
} from './category.dto.js'
import type { CategoryService } from './category.service.js'

export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  async create(req: Request, res: Response) {
    const input = createCategorySchema.parse(req.body)
    const userId = req.auth.userId

    const category = await this.categoryService.create({
      userId,
      name: input.name,
    })

    res.status(201).json(category)
  }

  async update(req: Request, res: Response) {
    const { id } = categoryIdParamsSchema.parse(req.params)
    const userId = req.auth.userId
    const { name } = updateCategorySchema.parse(req.body)

    const category = await this.categoryService.update({
      id,
      userId,
      name,
    })

    res.status(200).json(category)
  }

  async findById(req: Request, res: Response) {
    const { id } = categoryIdParamsSchema.parse(req.params)
    const userId = req.auth.userId

    const category = await this.categoryService.findById({
      id,
      userId,
    })

    res.status(200).json(category)
  }

  async findAll(req: Request, res: Response) {
    const userId = req.auth.userId

    const categories = await this.categoryService.findAll({
      userId,
    })

    res.status(200).json(categories)
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
