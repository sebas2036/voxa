import { Router, Request, Response } from 'express'
import { getProvider } from '../oauth/registry'
import { generateState, generateCodeVerifier } from '../oauth/pkce'
import { savePending, consumePending } from '../oauth/session'

export const authRouter = Router()

function redirectUriFor(providerId: string): string {
  const base = process.env.PUBLIC_BACKEND_URL || 'http://localhost:3000'
  return `${base}/auth/${providerId}/callback`
}

function appReturnUrl(providerId: string, query: Record<string, string>): string {
  const scheme = process.env.APP_SCHEME || 'glosx'
  const qs = new URLSearchParams(query).toString()
  return `${scheme}://auth/${providerId}?${qs}`
}

authRouter.get('/auth/:provider', (req: Request, res: Response) => {
  const providerId = String(req.params.provider)
  const provider = getProvider(providerId)
  if (!provider) return void res.status(404).json({ error: 'unknown provider' })
  if (!provider.isConfigured()) return void res.status(503).json({ error: `${providerId} no configurado` })
  const state = generateState()
  const codeVerifier = provider.usesPKCE ? generateCodeVerifier() : undefined
  savePending(state, { provider: providerId as any, codeVerifier })
  res.redirect(provider.buildAuthUrl(redirectUriFor(providerId), state, codeVerifier))
})

authRouter.get('/auth/:provider/callback', async (req: Request, res: Response) => {
  const providerId = String(req.params.provider)
  const { code, state, error } = req.query as Record<string, string>
  const provider = getProvider(providerId)
  if (!provider) return void res.status(404).json({ error: 'unknown provider' })
  if (error || !code || !state) return void res.redirect(appReturnUrl(providerId, { error: error || 'missing_code' }))
  const pending = consumePending(state)
  if (!pending || pending.provider !== providerId) return void res.redirect(appReturnUrl(providerId, { error: 'invalid_state' }))
  try {
    const tokens = await provider.exchangeCode({ code, redirectUri: redirectUriFor(providerId), codeVerifier: pending.codeVerifier })
    res.redirect(appReturnUrl(providerId, {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken || '',
      expires_in: String(tokens.expiresIn ?? ''),
      extra: tokens.extra ? JSON.stringify(tokens.extra) : '',
    }))
  } catch (e: any) {
    res.redirect(appReturnUrl(providerId, { error: e.message || 'exchange_failed' }))
  }
})

authRouter.post('/auth/:provider/refresh', async (req: Request, res: Response) => {
  const providerId = String(req.params.provider)
  const { refreshToken } = req.body as { refreshToken: string }
  const provider = getProvider(providerId)
  if (!provider || !provider.refresh) return void res.status(400).json({ error: 'refresh not supported' })
  try {
    res.json(await provider.refresh(refreshToken))
  } catch (e: any) {
    res.status(400).json({ error: e.message })
  }
})
