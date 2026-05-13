import { Linking } from 'react-native'
import * as Clipboard from 'expo-clipboard'

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
    key: 'linkedin',
    name: 'LinkedIn',
    color: '#4a9eff',
    getDeepLink: (content) => `linkedin://shareArticle?text=${encodeURIComponent(content)}`,
    fallbackUrl: 'https://www.linkedin.com/sharing/share-offsite/?url=',
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

export async function publishToPlatform(platform: Platform, content: string): Promise<boolean> {
  const deepLink = platform.getDeepLink(content)
  
  try {
    const canOpen = await Linking.canOpenURL(deepLink)
    if (canOpen) {
      await Linking.openURL(deepLink)
      return true
    } else {
      // App no instalada — copiar al clipboard y abrir web
      await Clipboard.setStringAsync(content)
      await Linking.openURL(platform.fallbackUrl)
      return false
    }
  } catch (e) {
    await Clipboard.setStringAsync(content)
    return false
  }
}

export async function publishToAll(
  platforms: Platform[],
  contents: Record<string, string>
): Promise<void> {
  for (const platform of platforms) {
    const content = contents[platform.key] || ''
    await publishToPlatform(platform, content)
    // Pequeña pausa entre apps
    await new Promise(resolve => setTimeout(resolve, 800))
  }
}
