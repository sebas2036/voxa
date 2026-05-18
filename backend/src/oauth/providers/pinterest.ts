import { codeChallengeFromVerifier } from '../pkce'
import { OAuthProvider, TokenResult, PublishResult } from '../types'

const SCOPES = 'pins:write,boards:read,user_accounts:read'

export const pinterestProvider: OAuthProvider = {
  id: 'pinterest',
  usesPKCE: true,

  isConfigured() {
    return Boolean(process.env.PINTEREST_CLIENT_ID && process.env.PINTEREST_CLIENT_SECRET)
  },

  buildAuthUrl(redirectUri, state, codeVerifier) {
    if (!codeVerifier) throw new Error('pinterest requires PKCE verifier')
    const challenge = codeChallengeFromVerifier(codeVerifier)
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.PINTEREST_CLIENT_ID!,
      redirect_uri: redirectUri,
      scope: SCOPES,
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    })
    return `https://www.pinterest.com/oauth/?${params.toString()}`
  },

  async exchangeCode({ code, redirectUri, codeVerifier }): Promise<TokenResult> {
    const clientId = process.env.PINTEREST_CLIENT_ID!
    const clientSecret = process.env.PINTEREST_CLIENT_SECRET!
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier!,
    })
    const res = await fetch('https://api.pinterest.com/v5/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
      },
      body: body.toString(),
    })
    const data: any = await res.json()
    if (!data.access_token) throw new Error(data.message || 'pinterest token exchange failed')
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    }
  },

  // Pinterest requiere imagen para crear pin. Sin imagen no se publica.
  async publish({ accessToken, content, extra }): Promise<PublishResult> {
    const boardId: string | undefined = extra?.boardId
    const imageUrl: string | undefined = extra?.imageUrl
    if (!boardId || !imageUrl) {
      return { success: false, error: 'pinterest requires boardId + imageUrl in extra' }
    }
    const res = await fetch('https://api.pinterest.com/v5/pins', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        board_id: boardId,
        description: content,
        media_source: { source_type: 'image_url', url: imageUrl },
      }),
    })
    const data: any = await res.json()
    if (data.id) return { success: true, id: data.id, url: `https://www.pinterest.com/pin/${data.id}` }
    return { success: false, error: data.message || 'pinterest pin failed' }
  },
}
