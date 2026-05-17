import Anthropic from '@anthropic-ai/sdk'
import * as dotenv from 'dotenv'

dotenv.config({ path: '../.env' })

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

async function testClaude() {
  console.log('🎙  GlosX — Test conexión Claude API...\n')

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: 'Sos el núcleo de GlosX, una app de creación de contenido. Respondé en una sola línea: ¿estás listo para transformar ideas en contenido?'
      }
    ]
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  console.log('✓ Claude responde:', text)
  console.log('\n✓ Conexión exitosa — Fase 0 completada')
}

testClaude().catch(console.error)
