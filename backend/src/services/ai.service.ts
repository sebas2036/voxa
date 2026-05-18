import Anthropic from '@anthropic-ai/sdk'
import { GlosX_SYSTEM_PROMPT, buildUserPrompt, buildSinglePlatformPrompt } from './glosx-prompt'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function generateContent(input: string, styleProfile?: string) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1500,
    system: GlosX_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt(input, styleProfile) }]
  })

  const rawText = response.content[0].type === 'text' ? response.content[0].text : ''
  const clean = rawText.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

export async function generateContentForPlatform(
  platform: string,
  input: string,
  tone?: string,
  voiceProfile?: string
) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1200,
    messages: [{ role: 'user', content: buildSinglePlatformPrompt(platform, input, tone, voiceProfile) }]
  })

  const rawText = response.content[0].type === 'text' ? response.content[0].text : ''
  const clean = rawText.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}