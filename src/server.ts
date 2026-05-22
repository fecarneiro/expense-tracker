import cookieParser from 'cookie-parser'
import express from 'express'
import { db } from './database/db.js'
import { authMiddleware } from './middlewares/auth.middleware.js'
import { errorMiddleware } from './middlewares/error.middleware.js'
import { AuthController } from './modules/auth/auth.controller.js'
import { authRouter } from './modules/auth/auth.routes.js'
import { AuthService } from './modules/auth/auth.service.js'
import { UserRepository } from './modules/users/user.repository.js'
import { UserService } from './modules/users/user.service.js'
import { UserController } from './modules/users/users.controller.js'
import { userRouter } from './modules/users/users.routes.js'
import { PasswordHasher } from './shared/password-hasher.js'

const port = Number(process.env.PORT ?? 3000)
const server = express()

//----- Compositions
// Shared
const passwordHasher = new PasswordHasher()
// Repositories
const userRepository = new UserRepository(db)
// Services
const userService = new UserService(userRepository, passwordHasher)
const authService = new AuthService(userRepository, passwordHasher)
// Controllers
const userController = new UserController(userService)
const authController = new AuthController(authService)

server.disable('x-powered-by')
server.use(cookieParser())
server.use(express.json())

server.use('/users', userRouter(userController))
server.use('/', authRouter(authController))

server.get('/', authMiddleware, (_req, res) => {
  res.status(200).json({ message: 'Authenticated!' })
})

server.listen(port, () => {
  console.log(`Server is running on port: ${port}`)
})

server.use(errorMiddleware)
