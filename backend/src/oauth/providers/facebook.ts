import { OAuthProvider, TokenResult, PublishResult } from '../types'

const GRAPH = 'https://graph.facebook.com/v21.0'
const SCOPES = 'pages_manage_posts,pages_read_engagement,pages_show_list'

export const facebookProvider: OAuthProvider = {
  id: 'facebook',
  usesPKCE: false,

  isConfigured() {
    return Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET)
  },

  buildAuthUrl(redirectUri, state) {
    const params = new URLSearchParams({
      client_id: process.env.FACEBOOK_APP_ID!,
      redirect_uri: redirectUri,
      state,
      scope: SCOPES,
      response_type: 'code',
    })
    return `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`
  },

  async exchangeCode({ code, redirectUri }): Promise<TokenResult> {
    const params = new URLSearchParams({
      client_id: process.env.FACEBOOK_APP_ID!,
      client_secret: process.env.FACEBOOK_APP_SECRET!,
      redirect_uri: redirectUri,
      code,
    })
    const res = await fetch(`${GRAPH}/oauth/access_token?${params.toString()}`)
    const data: any = await res.json()
    if (!data.access_token) throw new Error(data.error?.message || 'facebook token exchange failed')

    // Cambiamos a long-lived token y guardamos pageId+pageAccessToken para publicar a la primera página.
    const longLived = await fetch(
      `${GRAPH}/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&fb_exchange_token=${data.access_token}`
    ).then(r => r.json() as Promise<any>)

    const userToken = longLived.access_token || data.access_token
    const pages = await fetch(`${GRAPH}/me/accounts?access_token=${userToken}`).then(r => r.json() as Promise<any>)
    const firstPage = pages?.data?.[0]

    return {
      accessToken: userToken,
      expiresIn: longLived.expires_in,
      extra: {
        pageId: firstPage?.id,
        pageAccessToken: firstPage?.access_token,
        pageName: firstPage?.name,
      },
    }
  },

  async publish({ content, extra }): Promise<PublishResult> {
    const pageId: string | undefined = extra?.pageId
    const pageToken: string | undefined = extra?.pageAccessToken
    if (!pageId || !pageToken) {
      return { success: false, error: 'facebook requires a Page (none found on this account)' }
    }
    const res = await fetch(`${GRAPH}/${pageId}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: content, access_token: pageToken }),
    })
    const data: any = await res.json()
    if (data.id) return { success: true, id: data.id, url: `https://facebook.com/${data.id}` }
    return { success: false, error: data.error?.message || 'facebook publish failed' }
  },
}
