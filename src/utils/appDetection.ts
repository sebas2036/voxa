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
  const existing = await AsyncStorage.getItem('glosx_app_management')
  if (existing) return
  const installed = await detectInstalledApps()
  const mgmt: Record<string, boolean> = { __v: 4 } as any
  for (const key of Object.keys(APP_SCHEMES)) {
    // Solo activa las que están instaladas en el dispositivo
    // Fallback: si no se puede detectar (simulador), activa las 4 por defecto
    const detected = installed[key]
    const isSimulatorFallback = Object.values(installed).every(v => v === false)
    if (isSimulatorFallback) {
      mgmt[key] = false
    } else {
      mgmt[key] = detected === true
    }
  }
  await AsyncStorage.setItem('glosx_app_management', JSON.stringify(mgmt))
}

export async function recheckInstalledApps(): Promise<{ newApps: string[] }> {
  const installed = await detectInstalledApps()
  const existing = await AsyncStorage.getItem('glosx_app_management')
  const mgmt = existing ? JSON.parse(existing) : {}
  const newApps: string[] = []
  for (const [key, isInstalled] of Object.entries(installed)) {
    if (isInstalled && mgmt[key] === false) {
      newApps.push(key)
    }
  }
  return { newApps }
}
