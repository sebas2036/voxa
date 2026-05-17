import AsyncStorage from '@react-native-async-storage/async-storage'

const CACHE_KEY = 'GlosX_result_cache'
const MAX_CACHE = 10

export interface CachedResult {
  input: string
  tone: string
  result: any
  timestamp: number
}

export async function cacheResult(input: string, tone: string, result: any) {
  try {
    const stored = await AsyncStorage.getItem(CACHE_KEY)
    const cache: CachedResult[] = stored ? JSON.parse(stored) : []
    const updated = [
      { input, tone, result, timestamp: Date.now() },
      ...cache.filter(c => c.input !== input)
    ].slice(0, MAX_CACHE)
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(updated))
  } catch {}
}

export async function getCachedResult(input: string, tone: string): Promise<CachedResult | null> {
  try {
    const stored = await AsyncStorage.getItem(CACHE_KEY)
    if (!stored) return null
    const cache: CachedResult[] = JSON.parse(stored)
    return cache.find(c => c.input === input && c.tone === tone) || null
  } catch {
    return null
  }
}

export async function getLastCachedResult(): Promise<CachedResult | null> {
  try {
    const stored = await AsyncStorage.getItem(CACHE_KEY)
    if (!stored) return null
    const cache: CachedResult[] = JSON.parse(stored)
    return cache[0] || null
  } catch {
    return null
  }
}

export async function isOnline(): Promise<boolean> {
  try {
    const res = await fetch('https://www.google.com', { method: 'HEAD' })
    return res.ok
  } catch {
    return false
  }
}
