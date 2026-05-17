import AsyncStorage from '@react-native-async-storage/async-storage'
import { ProviderId } from '../constants/providers'

const PREFIX = 'glosx_oauth_'

interface StoredTokens {
  accessToken: string
  refreshToken?: string
  expiresAt?: number
  extra?: Record<string, any>
}

function key(provider: ProviderId): string {
  return `${PREFIX}${provider}`
}

export async function saveTokens(provider: ProviderId, tokens: StoredTokens): Promise<void> {
  await AsyncStorage.setItem(key(provider), JSON.stringify(tokens))
}

export async function getTokens(provider: ProviderId): Promise<StoredTokens | null> {
  const raw = await AsyncStorage.getItem(key(provider))
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export async function getAccessToken(provider: ProviderId): Promise<string | null> {
  const t = await getTokens(provider)
  return t?.accessToken ?? null
}

export async function isConnected(provider: ProviderId): Promise<boolean> {
  const t = await getTokens(provider)
  return !!t?.accessToken
}

export async function disconnect(provider: ProviderId): Promise<void> {
  await AsyncStorage.removeItem(key(provider))
}

export async function isExpired(provider: ProviderId): Promise<boolean> {
  const t = await getTokens(provider)
  if (!t?.expiresAt) return false
  return Date.now() >= t.expiresAt - 60_000
}
