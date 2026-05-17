import { OAuthProvider, TokenResult, PublishResult } from '../types'

const SCOPES = 'openid profile w_member_social'

export const linkedinProvider: OAuthProvider = {
  id: 'linkedin',
  usesPKCE: false,

  isConfigured() {
    return Boolean(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET)
  },

  buildAuthUrl(redirectUri, state) {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      redirect_uri: redirectUri,
      scope: SCOPES,
      state,
    })
    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`
  },

  async exchangeCode({ code, redirectUri }): Promise<TokenResult> {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
    })
    const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })
    const data: any = await res.json()
    if (!data.access_token) throw new Error(data.error_description || 'linkedin token exchange failed')

    const me = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    })
    const meData: any = await me.json()

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
      extra: { personUrn: `urn:li:person:${meData.sub}` },
    }
  },

  async publish({ accessToken, content, extra }): Promise<PublishResult> {
    const author: string | undefined = extra?.personUrn
    if (!author) return { success: false, error: 'missing personUrn — re-authenticate' }
    const payload = {
      author,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: content },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    }
    const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(payload),
    })
    const id = res.headers.get('x-restli-id') || undefined
    if (res.ok && id) return { success: true, id, url: `https://www.linkedin.com/feed/update/${id}` }
    const data: any = await res.json().catch(() => ({}))
    return { success: false, error: data.message || `linkedin post failed (${res.status})` }
  },
}
