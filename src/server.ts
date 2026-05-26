import cookieParser from 'cookie-parser'
import express from 'express'
import { db } from './database/db.js'
import { authMiddleware } from './middlewares/auth.middleware.js'
import { errorMiddleware } from './middlewares/error.middleware.js'
import { AuthController } from './modules/auth/auth.controller.js'
import { authRouter } from './modules/auth/auth.routes.js'
import { AuthService } from './modules/auth/auth.service.js'
import { CategoryController } from './modules/categories/category.controller.js'
import { CategoryRepository } from './modules/categories/category.repository.js'
import { categoryRouter } from './modules/categories/category.routes.js'
import { CategoryService } from './modules/categories/category.service.js'
import { TransactionController } from './modules/transactions/transaction.controller.js'
import { TransactionRepository } from './modules/transactions/transaction.repository.js'
import { transactionRouter } from './modules/transactions/transaction.routes.js'
import { TransactionService } from './modules/transactions/transaction.service.js'
import { UserController } from './modules/users/user.controller.js'
import { UserRepository } from './modules/users/user.repository.js'
import { userRouter } from './modules/users/user.routes.js'
import { UserService } from './modules/users/user.service.js'
import { PasswordHasher } from './shared/password-hasher.js'

const port = Number(process.env.PORT ?? 3000)
const server = express()

//----- Compositions
// Shared
const passwordHasher = new PasswordHasher()
// Repositories
const userRepository = new UserRepository(db)
const categoryRepository = new CategoryRepository(db)
const transactionRepository = new TransactionRepository(db)
// Services
const authService = new AuthService(userRepository, passwordHasher)
const userService = new UserService(userRepository, passwordHasher)
const categoryService = new CategoryService(categoryRepository)
const transactionService = new TransactionService(transactionRepository)
// Controllers
const authController = new AuthController(authService)
const userController = new UserController(userService)
const categoryController = new CategoryController(categoryService)
const transactionController = new TransactionController(transactionService)

server.disable('x-powered-by')
server.use(cookieParser())
server.use(express.json())

server.use('/auth', authRouter(authController))

server.use(authMiddleware)
server.use('/users', userRouter(userController))
server.use('/categories', categoryRouter(categoryController))
server.use('/transactions', transactionRouter(transactionController))

server.use('/', (_req, res) => {
  res.status(404).json({ message: 'Not found' })
})

server.use(errorMiddleware)

server.listen(port, () => {
  console.log(`Server is running on port: ${port}`)
})
