import Anthropic from '@anthropic-ai/sdk'
import { VOXA_SYSTEM_PROMPT, buildUserPrompt } from './voxa-prompt'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function generateContent(input: string, styleProfile?: string) {
  const response = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 1500,
    system: VOXA_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt(input, styleProfile) }]
  })

  const rawText = response.content[0].type === 'text' ? response.content[0].text : ''
  const clean = rawText.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}
