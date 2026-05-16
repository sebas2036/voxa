import { Linking } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface Platform {
  key: string
  name: string
  color: string
  getDeepLink: (content: string) => string
  fallbackUrl: string
}

export const PLATFORMS: Platform[] = [
  {
    key: 'twitter',
    name: 'X',
    color: '#1a1a1a',
    getDeepLink: (content) => `twitter://post?message=${encodeURIComponent(content)}`,
    fallbackUrl: 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(''),
  },
  {
    key: 'reddit',
    name: 'Reddit',
    color: '#FF4500',
    getDeepLink: (content) => `reddit://submit?title=${encodeURIComponent(content)}`,
    fallbackUrl: 'https://www.reddit.com/submit',
  },
  {
    key: 'threads',
    name: 'Threads',
    color: '#444444',
    getDeepLink: (content) => `barcelona://create?text=${encodeURIComponent(content)}`,
    fallbackUrl: 'https://www.threads.net/intent/post?text=' + encodeURIComponent(''),
  },
  {
    key: 'instagram',
    name: 'Instagram',
    color: '#e1306c',
    getDeepLink: (content) => `instagram://library`,
    fallbackUrl: 'https://www.instagram.com',
  },
]

export const REDDIT_EXTRA = { key: 'reddit', name: 'Reddit', color: '#FF4500', getDeepLink: (content: string) => `reddit://submit?title=${encodeURIComponent(content)}`, fallbackUrl: 'https://www.reddit.com/submit' }

export async function publishToPlatform(platform: Platform, content: string): Promise<boolean> {
  if (platform.key === 'twitter') {
    const token = await AsyncStorage.getItem('twitter_access_token')
    if (token) {
      try {
        const res = await fetch('http://192.168.0.23:3000/publish/twitter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: token, content })
        })
        const data = await res.json()
        if (data.success) return true
      } catch (e) {
        console.error('Twitter API error:', e)
      }
    }
  }
  const deepLink = platform.getDeepLink(content)
  try {
    await Clipboard.setStringAsync(content)
    await Linking.openURL(deepLink)
    return true
  } catch (e) {
    try {
      await Clipboard.setStringAsync(content)
      await Linking.openURL(platform.fallbackUrl)
    } catch {}
    return false
  }
}

export async function publishToAll(
  platforms: Platform[],
  contents: Record<string, string>
): Promise<void> {
  for (const platform of platforms) {
    const content = contents[platform.key] || ''
    // Timeout de 1.5s por plataforma para no colgarse
    await Promise.race([
      publishToPlatform(platform, content),
      new Promise(resolve => setTimeout(resolve, 1500))
    ])
    await new Promise(resolve => setTimeout(resolve, 300))
  }
}
