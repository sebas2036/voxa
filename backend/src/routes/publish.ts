import { Router, Request, Response } from 'express'
import { getProvider } from '../oauth/registry'

export const publishRouter = Router()

publishRouter.post('/publish/:provider', async (req: Request, res: Response) => {
  const { provider: providerId } = req.params
  const { accessToken, content, extra } = req.body as { accessToken: string; content: string; extra?: Record<string, any> }
  const provider = getProvider(providerId)
  if (!provider) return void res.status(404).json({ error: 'unknown provider' })
  if (!accessToken || !content) return void res.status(400).json({ error: 'accessToken y content son requeridos' })
  try {
    const result = await provider.publish({ accessToken, content, extra })
    if (!result.success) return void res.status(400).json(result)
    res.json(result)
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})
