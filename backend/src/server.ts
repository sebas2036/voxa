import { config } from 'dotenv'
import path from 'path'
config({ path: path.resolve(__dirname, '../../.env') })

import Fastify from 'fastify'
import cors from '@fastify/cors'
import { authRoutes } from './routes/auth'
import { publishRoutes } from './routes/publish'
import { generateRoutes } from './routes/generate'

const server = Fastify({ logger: true })

server.register(cors, { origin: '*' })

server.get('/health', async () => ({ status: 'ok', service: 'glosx-api' }))

server.register(authRoutes)
server.register(publishRoutes)
server.register(generateRoutes)

const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' })
    console.log('glosx API corriendo en http://localhost:3000')
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

start()
