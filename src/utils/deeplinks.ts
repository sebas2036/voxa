import { Linking } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import { API_URL } from '../constants/api'
import { PROVIDERS, ProviderId, getProvider } from '../constants/providers'
import { getTokens } from '../lib/tokenStorage'

export interface Platform {
  key: ProviderId
  name: string
  color: string
  getDeepLink: (content: string) => string
  fallbackUrl: string
}

const COLORS: Record<ProviderId, string> = {
  twitter: '#1a1a1a',
  reddit: '#FF4500',
  threads: '#444444',
  instagram: '#e1306c',
  linkedin: '#0a66c2',
  pinterest: '#e60023',
  tiktok: '#000000',
  facebook: '#1877f2',
  whatsapp: '#25d366',
  telegram: '#0088cc',
}

function asPlatform(id: ProviderId): Platform {
  const meta = PROVIDERS[id]
  return {
    key: id,
    name: meta.name,
    color: COLORS[id] || '#444',
    getDeepLink: meta.deepLink || (() => meta.fallbackUrl || ''),
    fallbackUrl: meta.fallbackUrl || '',
  }
}

export const PLATFORMS: Platform[] = (['twitter', 'reddit', 'threads', 'instagram'] as ProviderId[]).map(asPlatform)
export const REDDIT_EXTRA = asPlatform('reddit')

export async function publishToPlatform(platform: Platform, content: string, extra?: Record<string, any>): Promise<boolean> {
  const meta = getProvider(platform.key)
  if (meta?.hasOAuth) {
    const tokens = await getTokens(platform.key)
    if (tokens?.accessToken) {
      try {
        const res = await fetch(`${API_URL}/publish/${platform.key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accessToken: tokens.accessToken,
            content,
            extra: { ...(tokens.extra || {}), ...(extra || {}) },
          }),
        })
        const data = await res.json()
        if (data.success) return true
      } catch (e) {
        console.error(`${platform.key} API publish error:`, e)
      }
    }
  }
  // fallback: copia + deep link
  try {
    await Clipboard.setStringAsync(content)
    await Linking.openURL(platform.getDeepLink(content))
    return true
  } catch {
    try {
      await Clipboard.setStringAsync(content)
      await Linking.openURL(platform.fallbackUrl)
    } catch {}
    return false
  }
}

export async function publishToAll(platforms: Platform[], contents: Record<string, string>): Promise<void> {
  for (const platform of platforms) {
    const content = contents[platform.key] || ''
    await Promise.race([
      publishToPlatform(platform, content),
      new Promise(resolve => setTimeout(resolve, 1500)),
    ])
    await new Promise(resolve => setTimeout(resolve, 300))
  }
}
