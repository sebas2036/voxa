import { useCallback, useEffect, useState } from 'react'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import { API_URL } from '../constants/api'
import { ProviderId } from '../constants/providers'
import { saveTokens, getTokens, disconnect as clearTokens, isConnected as checkConnected } from '../lib/tokenStorage'

const APP_SCHEME = 'glosx'

export function useOAuth(provider: ProviderId) {
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { checkConnected(provider).then(setConnected) }, [provider])

  const connect = useCallback(async (): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const returnUrl = `${APP_SCHEME}://auth/${provider}`
      const authUrl = `${API_URL}/auth/${provider}`
      const result = await WebBrowser.openAuthSessionAsync(authUrl, returnUrl)
      if (result.type !== 'success' || !result.url) {
        setError('cancelado')
        return false
      }
      const parsed = Linking.parse(result.url)
      const q = (parsed.queryParams || {}) as Record<string, string>
      if (q.error) {
        setError(q.error)
        return false
      }
      if (!q.access_token) {
        setError('sin token')
        return false
      }
      const expiresIn = q.expires_in ? parseInt(q.expires_in, 10) : undefined
      let extra: Record<string, any> | undefined
      if (q.extra) { try { extra = JSON.parse(q.extra) } catch {} }
      await saveTokens(provider, {
        accessToken: q.access_token,
        refreshToken: q.refresh_token || undefined,
        expiresAt: expiresIn ? Date.now() + expiresIn * 1000 : undefined,
        extra,
      })
      setConnected(true)
      return true
    } catch (e: any) {
      setError(e.message || 'error desconocido')
      return false
    } finally {
      setLoading(false)
    }
  }, [provider])

  const disconnect = useCallback(async () => {
    await clearTokens(provider)
    setConnected(false)
  }, [provider])

  const publish = useCallback(async (content: string, extraPayload?: Record<string, any>): Promise<boolean> => {
    const tokens = await getTokens(provider)
    if (!tokens?.accessToken) return false
    try {
      const res = await fetch(`${API_URL}/publish/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: tokens.accessToken,
          content,
          extra: { ...(tokens.extra || {}), ...(extraPayload || {}) },
        }),
      })
      const data = await res.json()
      return data.success === true
    } catch {
      return false
    }
  }, [provider])

  return { connected, loading, error, connect, disconnect, publish }
}
