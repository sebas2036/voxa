import Fastify from 'fastify'
import cors from '@fastify/cors'
import { generateContent, generateContentForPlatform } from './services/ai.service'

const server = Fastify({ logger: true })

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
    const platformRules: Record<string, string> = {
      'WhatsApp':  lang === 'es' ? 'Mensaje directo y personal, como si se lo mandaras a un amigo. Podés usar emojis con criterio. Máximo 3 párrafos cortos.' : 'Direct and personal message, like texting a friend. Emojis allowed. Max 3 short paragraphs.',
      'Telegram':  lang === 'es' ? 'Tono informativo pero cercano. Puede ser algo más largo que WhatsApp. Sin hashtags.' : 'Informative but friendly tone. Can be slightly longer than WhatsApp. No hashtags.',
      'TikTok':    lang === 'es' ? 'Texto para video corto. Gancho en la primera línea, energético, usa emojis y lenguaje joven. Máximo 150 caracteres.' : 'Short video caption. Strong hook, energetic, emojis, youth language. Max 150 chars.',
      'Facebook':  lang === 'es' ? 'Tono cálido y conversacional. Puede ser más largo. Termina con una pregunta para generar interacción.' : 'Warm and conversational. Can be longer. End with a question to drive engagement.',
      'Pinterest': lang === 'es' ? 'Descripción visual e inspiracional. Enfocada en el estilo de vida. 2-3 oraciones + hashtags relevantes.' : 'Visual and inspirational description. Lifestyle-focused. 2-3 sentences + relevant hashtags.',
      'LinkedIn':  lang === 'es' ? 'Tono profesional pero humano. Insight o aprendizaje concreto. Termina con pregunta al lector. 150-300 palabras.' : 'Professional but human tone. Concrete insight or learning. End with a question. 150-300 words.',
    }
    const rules = platformRules[platform] || (lang === 'es' ? `Adaptalo para ${platform} con su tono típico.` : `Adapt it for ${platform} with its typical tone.`)
    const prompt = lang === 'es'
      ? `Sos la voz detrás de Voxa. Escribís como una persona real, no una máquina.
Tenés este contenido sobre "${topic}": "${baseContent}".
Adaptalo para ${platform}. Reglas: ${rules}
Solo devolvé el texto adaptado, sin explicaciones.`
      : `You are the voice behind Voxa. You write like a real person, not a machine.
You have this content about "${topic}": "${baseContent}".
Adapt it for ${platform}. Rules: ${rules}
Return only the adapted text, no explanations.`
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