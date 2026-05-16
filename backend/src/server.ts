import Fastify from 'fastify'
import cors from '@fastify/cors'
import { generateContent, generateContentForPlatform } from './services/ai.service'

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

server.post('/generate-single', async (request, reply) => {
  const { platform, input, tone } = request.body as {
    platform: string
    input: string
    tone?: string
  }

  if (!platform || !input || input.trim().length === 0) {
    return reply.status(400).send({ error: 'platform e input son requeridos' })
  }

  try {
    const content = await generateContentForPlatform(platform, input.trim(), tone)
    return { platform, content }
  } catch (error: any) {
    console.error(`Error generando ${platform}:`, error.message)
    return reply.status(500).send({ error: `Error generando contenido para ${platform}` })
  }
})

server.post('/generate-extra', async (request, reply) => {
  const { platform, topic, baseContent, lang } = request.body as any
  try {
    const prompt = lang === 'es'
      ? `Tenés este contenido sobre "${topic}": "${baseContent}". Adaptalo para ${platform} con el tono típico de esa plataforma. Solo devolvé el texto adaptado.`
      : `You have this content about "${topic}": "${baseContent}". Adapt it for ${platform}. Return only the adapted text.`
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic()
    const message = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }]
    })
    const text = message.content[0].type === 'text' ? message.content[0].text : baseContent
    reply.send({ content: text.trim() })
  } catch (e: any) {
    console.error('generate-extra error:', e.message)
    reply.send({ content: baseContent })
  }
})

const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' })
    console.log('Voxa API corriendo en http://localhost:3000')
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

start()