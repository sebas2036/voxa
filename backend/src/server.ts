import Fastify from 'fastify'
import cors from '@fastify/cors'
import { generateContent } from './services/ai.service'

const server = Fastify({ logger: false })

server.register(cors, { origin: '*' })

server.get('/health', async () => {
  return { status: 'ok', service: 'voxa-api' }
})

server.post('/generate', async (request, reply) => {
  const { input, styleProfile } = request.body as {
    input: string
    styleProfile?: string
  }

  if (!input || input.trim().length === 0) {
    return reply.status(400).send({ error: 'input requerido' })
  }

  if (input.trim().length < 5) {
    return reply.status(400).send({ error: 'idea muy corta, escribí un poco más' })
  }

  const result = await generateContent(input.trim(), styleProfile)
  return result
})

const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' })
    console.log('🎙  Voxa API corriendo en http://localhost:3000')
    console.log('   POST /generate — genera contenido')
    console.log('   GET  /health   — estado del servidor')
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

start()

