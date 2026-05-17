import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_URL } from '../constants/api'

export function useExtraPlatforms(result: any, t: any) {
  const [extraPlatforms, setExtraPlatforms] = useState<any[]>([])
  const [extraContents, setExtraContents] = useState<Record<string, string>>({})
  const [loadingExtra, setLoadingExtra] = useState<string | null>(null)

  useEffect(() => {
    AsyncStorage.getItem('glosx_app_management').then(appVal => {
      const mgmt = appVal ? JSON.parse(appVal) : {}
      AsyncStorage.getItem('glosx_extra_platforms').then(val => {
        const saved: any[] = val ? JSON.parse(val) : []
        const REMOVED = ['email']
        const ALL_EXTRA = [
          { key: 'linkedin', name: 'LinkedIn', color: '#4a9eff' },
          { key: 'whatsapp', name: 'WhatsApp', color: '#25D366' },
          { key: 'telegram', name: 'Telegram', color: '#2AABEE' },
          { key: 'tiktok', name: 'TikTok', color: '#333333' },
          { key: 'facebook', name: 'Facebook', color: '#1877F2' },
          { key: 'pinterest', name: 'Pinterest', color: '#E60023' },
        ]
        const fromMgmt = ALL_EXTRA.filter((app: any) =>
          mgmt[app.key] === true &&
          !REMOVED.includes(app.key) &&
          !saved.some((s: any) => s.key === app.key)
        )
        const merged = [...saved, ...fromMgmt].filter(
          (p: any) => mgmt[p.key] !== false && !REMOVED.includes(p.key)
        )
        setExtraPlatforms(merged)
        merged.forEach((p: any) => generateExtraContent(p))
      })
    })
  }, [])

  useEffect(() => {
    if (extraPlatforms.length > 0)
      AsyncStorage.setItem('glosx_extra_platforms', JSON.stringify(extraPlatforms))
  }, [extraPlatforms])

  const generateExtraContent = async (platform: any) => {
    if (!result) return
    setLoadingExtra(platform.key)
    try {
      const baseContent = result.platforms['twitter']?.content || result.platforms['linkedin']?.content || ''
      const response = await fetch(`${API_URL}/generate-extra`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: platform.name, topic: result.analysis.topic, baseContent, lang: t.lang })
      })
      const data = await response.json()
      setExtraContents(prev => ({ ...prev, [platform.key]: data.content || baseContent }))
    } catch {
      const base = result.platforms['twitter']?.content || result.platforms['linkedin']?.content || ''
      setExtraContents(prev => ({ ...prev, [platform.key]: base }))
    }
    setLoadingExtra(null)
  }

  return { extraPlatforms, setExtraPlatforms, extraContents, setExtraContents, loadingExtra, generateExtraContent }
}
