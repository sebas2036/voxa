import { codeChallengeFromVerifier } from '../pkce'
import { OAuthProvider, TokenResult, PublishResult } from '../types'

const SCOPES = 'user.info.basic,video.publish'

export const tiktokProvider: OAuthProvider = {
  id: 'tiktok',
  usesPKCE: true,

  isConfigured() {
    return Boolean(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET)
  },

  buildAuthUrl(redirectUri, state, codeVerifier) {
    if (!codeVerifier) throw new Error('tiktok requires PKCE verifier')
    const challenge = codeChallengeFromVerifier(codeVerifier)
    const params = new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      response_type: 'code',
      scope: SCOPES,
      redirect_uri: redirectUri,
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    })
    return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`
  },

  async exchangeCode({ code, redirectUri, codeVerifier }): Promise<TokenResult> {
    const body = new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code_verifier: codeVerifier!,
    })
    const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })
    const data: any = await res.json()
    if (!data.access_token) throw new Error(data.error_description || 'tiktok token exchange failed')
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      extra: { openId: data.open_id },
    }
  },

  async publish({ accessToken, content, extra }): Promise<PublishResult> {
    const videoUrl: string | undefined = extra?.videoUrl
    if (!videoUrl) {
      return { success: false, error: 'tiktok requires videoUrl in extra (text-only posts not supported)' }
    }
    const res = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
        post_info: { title: content.slice(0, 150), privacy_level: 'SELF_ONLY' },
        source_info: { source: 'PULL_FROM_URL', video_url: videoUrl },
      }),
    })
    const data: any = await res.json()
    if (data?.data?.publish_id) return { success: true, id: data.data.publish_id }
    return { success: false, error: data?.error?.message || 'tiktok publish failed' }
  },
}
