import AsyncStorage from '@react-native-async-storage/async-storage'

const DEV_MODE_KEY = 'glosx_dev_mode'
const LOGS_KEY = 'glosx_dev_logs'
const METRICS_KEY = 'glosx_dev_metrics'
const MAX_LOGS = 50

export interface DevLog {
  timestamp: string
  level: 'info' | 'warn' | 'error'
  tag: string
  message: string
}

export interface DevMetrics {
  totalGenerations: number
  lastGeneration: string | null
  errors: number
  platformUsage: Record<string, number>
}

export async function isDevMode(): Promise<boolean> {
  const val = await AsyncStorage.getItem(DEV_MODE_KEY)
  return val === 'true'
}

export async function enableDevMode(): Promise<void> {
  await AsyncStorage.setItem(DEV_MODE_KEY, 'true')
}

export async function disableDevMode(): Promise<void> {
  await AsyncStorage.setItem(DEV_MODE_KEY, 'false')
}

export async function log(level: DevLog['level'], tag: string, message: string): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(LOGS_KEY)
    const logs: DevLog[] = stored ? JSON.parse(stored) : []
    logs.unshift({ timestamp: new Date().toISOString(), level, tag, message })
    await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, MAX_LOGS)))
  } catch {}
}

export async function getLogs(): Promise<DevLog[]> {
  const stored = await AsyncStorage.getItem(LOGS_KEY)
  return stored ? JSON.parse(stored) : []
}

export async function clearLogs(): Promise<void> {
  await AsyncStorage.removeItem(LOGS_KEY)
}

export async function getMetrics(): Promise<DevMetrics> {
  const stored = await AsyncStorage.getItem(METRICS_KEY)
  return stored ? JSON.parse(stored) : {
    totalGenerations: 0, lastGeneration: null, errors: 0, platformUsage: {}
  }
}

export async function trackGeneration(platforms: string[]): Promise<void> {
  const metrics = await getMetrics()
  metrics.totalGenerations += 1
  metrics.lastGeneration = new Date().toISOString()
  for (const p of platforms) {
    metrics.platformUsage[p] = (metrics.platformUsage[p] || 0) + 1
  }
  await AsyncStorage.setItem(METRICS_KEY, JSON.stringify(metrics))
}

export async function trackError(tag: string, message: string): Promise<void> {
  const metrics = await getMetrics()
  metrics.errors += 1
  await AsyncStorage.setItem(METRICS_KEY, JSON.stringify(metrics))
  await log('error', tag, message)
}

export async function clearMetrics(): Promise<void> {
  await AsyncStorage.removeItem(METRICS_KEY)
}
