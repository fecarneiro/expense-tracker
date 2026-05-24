import type { Request, Response } from 'express'
import {
  categoryParamsSchema,
  createCategorySchema,
  toCategoryResponse,
  updateCategorySchema,
} from './category.dto.js'
import type { CategoryService } from './category.service.js'

export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  async create(req: Request, res: Response) {
    const input = createCategorySchema.parse(req.body)
    const userId = req.cookies.userId

    const category = await this.categoryService.create({
      userId,
      name: input.name,
    })

    res.status(201).json(toCategoryResponse(category))
  }

  async update(req: Request, res: Response) {
    const { id } = categoryParamsSchema.parse(req.params)
    const { name } = updateCategorySchema.parse(req.body)
    const userId = req.cookies.userId

    const category = await this.categoryService.update({
      userId,
      id,
      name,
    })

    res.status(200).json(toCategoryResponse(category))
  }

  async findById(req: Request, res: Response) {
    const { id } = categoryParamsSchema.parse(req.params)
    const userId = req.cookies.userId

    const category = await this.categoryService.findById({
      id,
      userId,
    })

    res.status(200).json(toCategoryResponse(category))
  }

  async findAll(req: Request, res: Response) {
    const userId = req.cookies.userId

    const categories = await this.categoryService.findAll({
      userId,
    })

    res.status(200).json(categories.map(toCategoryResponse))
  }

  async delete(req: Request, res: Response) {
    const { id } = categoryParamsSchema.parse(req.params)

    const userId = req.cookies.userId

    await this.categoryService.delete({
      userId,
      id,
    })

    res.status(204).send()
  }
}
