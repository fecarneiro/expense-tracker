import express from 'express'
import { env } from './config/env.config.js'

const app = express()
const port = env.PORT

app.get('/', (_req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`)
})
