import { FastifyInstance } from 'fastify'
import { getProvider } from '../oauth/registry'
import { generateState, generateCodeVerifier } from '../oauth/pkce'
import { savePending, consumePending } from '../oauth/session'

function redirectUriFor(providerId: string): string {
  const base = process.env.PUBLIC_BACKEND_URL || 'http://localhost:3000'
  return `${base}/auth/${providerId}/callback`
}

function appReturnUrl(providerId: string, query: Record<string, string>): string {
  const scheme = process.env.APP_SCHEME || 'glosx'
  const qs = new URLSearchParams(query).toString()
  return `${scheme}://auth/${providerId}?${qs}`
}

export async function authRoutes(server: FastifyInstance) {
  // Inicio del flujo: el frontend abre esta URL en el navegador
  server.get('/auth/:provider', async (request, reply) => {
    const { provider: providerId } = request.params as { provider: string }
    const provider = getProvider(providerId)
    if (!provider) return reply.status(404).send({ error: 'unknown provider' })
    if (!provider.isConfigured()) {
      return reply.status(503).send({ error: `${providerId} no configurado (faltan creds en .env)` })
    }
    const state = generateState()
    const codeVerifier = provider.usesPKCE ? generateCodeVerifier() : undefined
    savePending(state, { provider: providerId as any, codeVerifier })
    const url = provider.buildAuthUrl(redirectUriFor(providerId), state, codeVerifier)
    return reply.redirect(url)
  })

  // Callback al que el provider redirige tras el login. Intercambiamos código y volvemos a la app.
  server.get('/auth/:provider/callback', async (request, reply) => {
    const { provider: providerId } = request.params as { provider: string }
    const { code, state, error } = request.query as Record<string, string>
    const provider = getProvider(providerId)
    if (!provider) return reply.status(404).send({ error: 'unknown provider' })

    if (error || !code || !state) {
      return reply.redirect(appReturnUrl(providerId, { error: error || 'missing_code' }))
    }

    const pending = consumePending(state)
    if (!pending || pending.provider !== providerId) {
      return reply.redirect(appReturnUrl(providerId, { error: 'invalid_state' }))
    }

    try {
      const tokens = await provider.exchangeCode({
        code,
        redirectUri: redirectUriFor(providerId),
        codeVerifier: pending.codeVerifier,
      })
      // Devolvemos los tokens vía deep link (la app los guarda en AsyncStorage).
      return reply.redirect(
        appReturnUrl(providerId, {
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken || '',
          expires_in: String(tokens.expiresIn ?? ''),
          extra: tokens.extra ? JSON.stringify(tokens.extra) : '',
        })
      )
    } catch (e: any) {
      console.error(`[oauth ${providerId}] exchange failed:`, e.message)
      return reply.redirect(appReturnUrl(providerId, { error: e.message || 'exchange_failed' }))
    }
  })

  // Refresh manual (opcional). El frontend lo llama cuando expires_in está por vencerse.
  server.post('/auth/:provider/refresh', async (request, reply) => {
    const { provider: providerId } = request.params as { provider: string }
    const { refreshToken } = request.body as { refreshToken: string }
    const provider = getProvider(providerId)
    if (!provider || !provider.refresh) {
      return reply.status(400).send({ error: 'refresh not supported' })
    }
    try {
      const tokens = await provider.refresh(refreshToken)
      return tokens
    } catch (e: any) {
      return reply.status(400).send({ error: e.message })
    }
  })
}
