import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { VoxaResult, generateContent } from '../services/voxa.service'

const HISTORY_KEY = 'voxa_recent_ideas'
const MAX_RECENT = 10

interface VoxaStore {
  input: string
  tone: string
  result: VoxaResult | null
  loading: boolean
  error: string | null
  recentIdeas: string[]
  setInput: (input: string) => void
  setTone: (tone: string) => void
  generate: () => Promise<void>
  updatePlatformContent: (platform: string, content: string) => void
  loadRecentIdeas: () => Promise<void>
  removeRecentIdea: (idea: string) => Promise<void>
  clearRecentIdeas: () => Promise<void>
  reset: () => void
}

export const useVoxStore = create<VoxaStore>((set, get) => ({
  input: '',
  tone: 'auto',
  result: null,
  loading: false,
  error: null,
  recentIdeas: [],

  setInput: (input) => set({ input }),
  setTone: (tone) => set({ tone }),

  removeRecentIdea: async (idea: string) => {
    const current = get().recentIdeas.filter(i => i !== idea)
    set({ recentIdeas: current })
    await AsyncStorage.setItem('voxa_recent_ideas', JSON.stringify(current))
  },
  clearRecentIdeas: async () => {
    set({ recentIdeas: [] })
    await AsyncStorage.removeItem('voxa_recent_ideas')
  },
  loadRecentIdeas: async () => {
    try {
      const stored = await AsyncStorage.getItem(HISTORY_KEY)
      if (stored) set({ recentIdeas: JSON.parse(stored) })
    } catch {}
  },

  generate: async () => {
    const { input, tone, recentIdeas } = get()
    if (!input.trim()) return
    set({ loading: true, error: null, result: null })
    try {
      const result = await generateContent(
        input.trim(),
        tone !== 'auto' ? tone : undefined
      )
      // Guardar en historial
      const updated = [input.trim(), ...recentIdeas.filter(i => i !== input.trim())].slice(0, MAX_RECENT)
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
      set({ result, loading: false, recentIdeas: updated })
    } catch (err: any) {
      set({ error: err.message, loading: false })
    }
  },

  updatePlatformContent: (platform, newContent) => set(state => ({
    result: state.result ? {
      ...state.result,
      platforms: {
        ...state.result.platforms,
        [platform]: { ...state.result.platforms[platform as keyof typeof state.result.platforms], content: newContent }
      }
    } : null
  })),

  reset: () => set({
    input: '',
    tone: 'auto',
    result: null,
    loading: false,
    error: null
  })
}))
