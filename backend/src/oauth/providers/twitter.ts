import { OAuthProvider, TokenResult, PublishResult } from '../types'

const SCOPES = 'tweet.read tweet.write users.read offline.access'

export const twitterProvider: OAuthProvider = {
  id: 'twitter',
  usesPKCE: true,

  isConfigured() {
    return Boolean(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET)
  },

  buildAuthUrl(redirectUri, state, codeVerifier) {
    if (!codeVerifier) throw new Error('twitter requires PKCE verifier')
    const challenge = require('../pkce').codeChallengeFromVerifier(codeVerifier)
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.TWITTER_CLIENT_ID!,
      redirect_uri: redirectUri,
      scope: SCOPES,
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    })
    return `https://twitter.com/i/oauth2/authorize?${params.toString()}`
  },

  async exchangeCode({ code, redirectUri, codeVerifier }): Promise<TokenResult> {
    const clientId = process.env.TWITTER_CLIENT_ID!
    const clientSecret = process.env.TWITTER_CLIENT_SECRET!
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      code_verifier: codeVerifier!,
    })
    const res = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
      },
      body: body.toString(),
    })
    const data: any = await res.json()
    if (!data.access_token) throw new Error(data.error_description || 'twitter token exchange failed')
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    }
  },

  async refresh(refreshToken): Promise<TokenResult> {
    const clientId = process.env.TWITTER_CLIENT_ID!
    const clientSecret = process.env.TWITTER_CLIENT_SECRET!
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
    })
    const res = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
      },
      body: body.toString(),
    })
    const data: any = await res.json()
    if (!data.access_token) throw new Error('twitter refresh failed')
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    }
  },

  async publish({ accessToken, content }): Promise<PublishResult> {
    const res = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: content }),
    })
    const data: any = await res.json()
    if (data.data?.id) {
      return { success: true, id: data.data.id, url: `https://twitter.com/i/status/${data.data.id}` }
    }
    return { success: false, error: data.detail || data.title || 'tweet failed' }
  },
}
