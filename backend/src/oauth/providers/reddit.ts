import { OAuthProvider, TokenResult, PublishResult } from '../types'

const SCOPES = 'identity submit'
const UA = process.env.REDDIT_USER_AGENT || 'glosx/1.0'

export const redditProvider: OAuthProvider = {
  id: 'reddit',
  usesPKCE: false,

  isConfigured() {
    return Boolean(process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET)
  },

  buildAuthUrl(redirectUri, state) {
    const params = new URLSearchParams({
      client_id: process.env.REDDIT_CLIENT_ID!,
      response_type: 'code',
      state,
      redirect_uri: redirectUri,
      duration: 'permanent',
      scope: SCOPES,
    })
    return `https://www.reddit.com/api/v1/authorize?${params.toString()}`
  },

  async exchangeCode({ code, redirectUri }): Promise<TokenResult> {
    const clientId = process.env.REDDIT_CLIENT_ID!
    const clientSecret = process.env.REDDIT_CLIENT_SECRET!
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    })
    const res = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': UA,
        Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
      },
      body: body.toString(),
    })
    const data: any = await res.json()
    if (!data.access_token) throw new Error(data.error || 'reddit token exchange failed')
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    }
  },

  async refresh(refreshToken): Promise<TokenResult> {
    const clientId = process.env.REDDIT_CLIENT_ID!
    const clientSecret = process.env.REDDIT_CLIENT_SECRET!
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    })
    const res = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': UA,
        Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
      },
      body: body.toString(),
    })
    const data: any = await res.json()
    if (!data.access_token) throw new Error('reddit refresh failed')
    return { accessToken: data.access_token, expiresIn: data.expires_in }
  },

  // Reddit requires subreddit. Para MVP publicamos al perfil del user (u_username) si no se pasa.
  async publish({ accessToken, content, extra }): Promise<PublishResult> {
    const subreddit: string | undefined = extra?.subreddit
    let sr = subreddit
    if (!sr) {
      const me = await fetch('https://oauth.reddit.com/api/v1/me', {
        headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': UA },
      })
      const meData: any = await me.json()
      sr = `u_${meData.name}`
    }
    const title = content.slice(0, 290)
    const body = new URLSearchParams({
      api_type: 'json',
      kind: 'self',
      sr: sr!,
      title,
      text: content.length > 290 ? content : '',
    })
    const res = await fetch('https://oauth.reddit.com/api/submit', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': UA,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })
    const data: any = await res.json()
    const url = data?.json?.data?.url
    if (url) return { success: true, url }
    return { success: false, error: data?.json?.errors?.[0]?.join(' ') || 'reddit submit failed' }
  },
}
