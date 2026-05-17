import { useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import { publishToAll } from '../utils/deeplinks'
import { API_URL } from '../constants/api'

export function usePublish({ result, extraContents, enabled, extraPlatforms, PLATFORMS, reset, navigation, t, showOnboarding, setShowOnboarding }: any) {
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)

  const handlePublish = async () => {
    const twitterEnabled = enabled['twitter']
    const twitterToken = await AsyncStorage.getItem('twitter_access_token')
    if (twitterEnabled && !twitterToken) {
      try {
        const res = await fetch(`${API_URL}/auth/twitter`)
        const { url, codeVerifier } = await res.json()
        await AsyncStorage.setItem('twitter_code_verifier', codeVerifier)
        const authResult = await WebBrowser.openAuthSessionAsync(url, 'glosx://auth/twitter')
        if (authResult.type === 'success' && authResult.url) {
          const parsed = Linking.parse(authResult.url)
          const code = parsed.queryParams?.code as string
          if (code) {
            const cbRes = await fetch(`${API_URL}/auth/twitter/callback`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code, codeVerifier })
            })
            const data = await cbRes.json()
            if (data.accessToken) await AsyncStorage.setItem('twitter_access_token', data.accessToken)
          }
        }
      } catch (e) { console.error('Twitter auto-auth:', e) }
    }

    setPublishing(true)
    const activePredefined = PLATFORMS.filter((p: any) => enabled[p.key])
    const activeExtra = extraPlatforms.filter((p: any) => enabled[p.key] !== false)
    const contents: Record<string, string> = {}

    activePredefined.forEach((platform: any) => {
      const pdata = result.platforms[platform.key]
      const hashtags = 'hashtags' in pdata ? (pdata as any).hashtags?.join(' ') : ''
      contents[platform.key] = hashtags ? `${pdata.content}\n\n${hashtags}` : pdata.content
    })
    activeExtra.forEach((platform: any) => {
      contents[platform.key] = extraContents[platform.key] || ''
    })

    const usedKeys = [...new Set([...activePredefined.map((p: any) => p.key), ...activeExtra.map((p: any) => p.key)])]
    await AsyncStorage.setItem('glosx_last_platforms', JSON.stringify(usedKeys))

    try {
      await Promise.race([
        publishToAll([...activePredefined, ...activeExtra], contents),
        new Promise(resolve => setTimeout(resolve, 5000))
      ])
    } catch {}

    setPublishing(false)
    setPublished(true)
    AsyncStorage.getItem('glosx_onboarding_shown').then(val => {
      if (!val) setShowOnboarding(true)
    })
    setTimeout(() => { reset(); navigation.navigate('Capture') }, showOnboarding ? 4000 : 2000)
  }

  return { publishing, published, setPublished, handlePublish }
}
