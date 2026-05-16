import { Linking } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const APP_SCHEMES: Record<string, string> = {
  twitter:   'twitter://',
  threads:   'barcelona://',
  instagram: 'instagram://',
  reddit:    'reddit://',
  whatsapp:  'whatsapp://',
  telegram:  'tg://',
  tiktok:    'tiktok://',
  facebook:  'fb://',
  pinterest: 'pinterest://',
}

export async function detectInstalledApps(): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {}
  for (const [key, scheme] of Object.entries(APP_SCHEMES)) {
    try {
      results[key] = await Linking.canOpenURL(scheme)
    } catch {
      results[key] = false
    }
  }
  return results
}

export async function initAppManagement() {
  const existing = await AsyncStorage.getItem('vox_app_management')
  if (existing) return
  const installed = await detectInstalledApps()
  const DEFAULT_ON = ['twitter', 'threads', 'instagram', 'reddit']
  const mgmt: Record<string, boolean> = { __v: 3 } as any
  for (const key of Object.keys(APP_SCHEMES)) {
    mgmt[key] = DEFAULT_ON.includes(key) ? true : installed[key] === true
  }
  await AsyncStorage.setItem('vox_app_management', JSON.stringify(mgmt))
}
