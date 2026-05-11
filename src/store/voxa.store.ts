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

  reset: () => set({
    input: '',
    tone: 'auto',
    result: null,
    loading: false,
    error: null
  })
}))
