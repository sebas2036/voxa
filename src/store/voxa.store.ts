import { create } from 'zustand'
import { VoxaResult, generateContent } from '../services/voxa.service'

interface VoxaStore {
  input: string
  tone: string
  result: VoxaResult | null
  loading: boolean
  error: string | null
  setInput: (input: string) => void
  setTone: (tone: string) => void
  generate: () => Promise<void>
  updatePlatformContent: (platform: string, content: string) => void
  updatePlatformContent: (platform: string, content: string) => void
  reset: () => void
}

export const useVoxaStore = create<VoxaStore>((set, get) => ({
  input: '',
  tone: 'auto',
  result: null,
  loading: false,
  error: null,

  setInput: (input) => set({ input }),
  setTone: (tone) => set({ tone }),

  generate: async () => {
    const { input, tone } = get()
    if (!input.trim()) return

    set({ loading: true, error: null, result: null })

    try {
      const result = await generateContent(
        input.trim(),
        tone !== 'auto' ? tone : undefined
      )
      set({ result, loading: false })
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
