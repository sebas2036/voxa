import { ProviderId } from './types'

interface PendingAuth {
  provider: ProviderId
  codeVerifier?: string
  createdAt: number
}

const TTL_MS = 10 * 60 * 1000
const store = new Map<string, PendingAuth>()

function gc() {
  const now = Date.now()
  for (const [k, v] of store) {
    if (now - v.createdAt > TTL_MS) store.delete(k)
  }
}

export function savePending(state: string, data: Omit<PendingAuth, 'createdAt'>): void {
  gc()
  store.set(state, { ...data, createdAt: Date.now() })
}

export function consumePending(state: string): PendingAuth | null {
  gc()
  const entry = store.get(state)
  if (!entry) return null
  store.delete(state)
  return entry
}
