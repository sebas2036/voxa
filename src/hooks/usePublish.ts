import { useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { publishToAll } from '../utils/deeplinks'

export function usePublish({ result, extraContents, enabled, extraPlatforms, PLATFORMS, reset, navigation, t, showOnboarding, setShowOnboarding }: any) {
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)

  const handlePublish = async () => {
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
        new Promise(resolve => setTimeout(resolve, 5000)),
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
