import { Router, Request, Response } from 'express'
import { generateContent, generateContentForPlatform } from '../services/ai.service'

export const generateRouter = Router()

generateRouter.post('/generate', async (req: Request, res: Response) => {
  const { input, styleProfile } = req.body as { input: string; styleProfile?: string }
  if (!input || input.trim().length === 0) return void res.status(400).json({ error: 'input requerido' })
  if (input.trim().length < 5) return void res.status(400).json({ error: 'idea muy corta' })
  try {
    res.json(await generateContent(input.trim(), styleProfile))
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

generateRouter.post('/generate-single', async (req: Request, res: Response) => {
  const { platform, input, tone, voiceProfile } = req.body as { platform: string; input: string; tone?: string; voiceProfile?: string }
  if (!platform || !input || input.trim().length === 0) return void res.status(400).json({ error: 'platform e input son requeridos' })
  try {
    const content = await generateContentForPlatform(platform, input.trim(), tone, voiceProfile)
    res.json({ platform, content })
  } catch (e: any) {
    res.status(500).json({ error: `Error generando contenido para ${platform}` })
  }
})

generateRouter.post('/generate-extra', async (req: Request, res: Response) => {
  const { platform, topic, baseContent, lang } = req.body as any
  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic()
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 500,
      messages: [{ role: 'user', content: `Adapt this content about "${topic}" for ${platform}: "${baseContent}". Return only the adapted text.` }],
    })
    const text = message.content[0].type === 'text' ? message.content[0].text : baseContent
    res.json({ content: text.trim() })
  } catch (e: any) {
    res.json({ content: baseContent })
  }
})
