import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getStyleProfile, buildStyleContext } from '../services/styleMemory'
import { trackGeneration } from '../services/devMonitor'
import { VoxaResult, generateContent, generateSinglePlatform, getPlatformGenerationOrder } from '../services/glosx.service'
import { trackTone, buildVoiceProfilePrompt, getVoiceProfile } from '../services/voiceProfile'
import { cacheResult, getCachedResult, isOnline } from '../utils/cache'

const HISTORY_KEY = 'GlosX_recent_ideas'
const MAX_RECENT = 10

const PREDEFINED_PLATFORMS = ['twitter', 'threads', 'instagram', 'reddit']

interface GlosXStore {
  input: string
  tone: string
  result: VoxaResult | null
  loading: boolean
  error: string | null
  recentIdeas: string[]
  mediaUri: string | null
  mediaType: 'image' | 'video' | null
  setMedia: (uri: string | null, type: 'image' | 'video' | null) => void
  mediaFilter: string
  setMediaFilter: (filter: string) => void
  progressivePlatforms: Record<string, 'pending' | 'loading' | 'done' | 'error'>
  setInput: (input: string) => void
  setTone: (tone: string) => void
  generate: () => Promise<void>
  generateProgressive: () => Promise<void>
  updatePlatformContent: (platform: string, content: string) => void
  loadRecentIdeas: () => Promise<void>
  removeRecentIdea: (idea: string) => Promise<void>
  clearRecentIdeas: () => Promise<void>
  reset: () => void
}

export const useGlosXStore = create<GlosXStore>((set, get) => ({
  input: '',
  tone: 'auto',
  mediaUri: null,
  mediaType: null,
  setMedia: (uri, type) => set({ mediaUri: uri, mediaType: type }),
  mediaFilter: 'original',
  setMediaFilter: (filter) => set({ mediaFilter: filter }),
  result: null,
  loading: false,
  error: null,
  recentIdeas: [],
  progressivePlatforms: {},

  setInput: (input) => set({ input }),
  setTone: (tone) => set({ tone }),

  removeRecentIdea: async (idea: string) => {
    const current = get().recentIdeas.filter(i => i !== idea)
    set({ recentIdeas: current })
    await AsyncStorage.setItem('GlosX_recent_ideas', JSON.stringify(current))
  },
  clearRecentIdeas: async () => {
    set({ recentIdeas: [] })
    await AsyncStorage.removeItem('GlosX_recent_ideas')
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
      const updated = [input.trim(), ...recentIdeas.filter(i => i !== input.trim())].slice(0, MAX_RECENT)
      trackGeneration(Object.keys(result.platforms)).catch(() => {})
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
      set({ result, loading: false, recentIdeas: updated })
    } catch (err: any) {
      set({ error: err.message, loading: false })
    }
  },

  generateProgressive: async () => {
    const { input, tone, recentIdeas } = get()
    if (!input.trim()) return
    if (tone !== 'auto') await trackTone(tone)
    const online = await isOnline()
    if (!online) {
      const cached = await getCachedResult(input.trim(), tone)
      if (cached) {
        set({ result: cached.result, loading: false, error: null, progressivePlatforms: {} })
        return
      }
      set({ error: 'Sin conexión y sin caché para esta idea', loading: false })
      return
    }
    set({ loading: true, error: null })

    const ordered = getPlatformGenerationOrder(PREDEFINED_PLATFORMS)

    const initialProgress: Record<string, 'pending' | 'loading' | 'done' | 'error'> = {}
    ordered.forEach(p => { initialProgress[p] = 'pending' })

    const emptyResult: VoxaResult = {
      detectedLanguage: 'spanish',
      analysis: { topic: input.trim(), emotion: '', intent: '', audience: '', contentType: '' },
      platforms: {
        twitter: { content: '', charCount: 0 },
        linkedin: { content: '', wordCount: 0 },
        threads: { content: '', charCount: 0 },
        instagram: { content: '', hashtags: [] },
        reddit: { content: '', charCount: 0 },
      },
      recommendation: { bestPlatform: '', bestDay: '', bestTime: '', reason: '' },
    }

    set({
      loading: false,
      error: null,
      result: emptyResult,
      progressivePlatforms: initialProgress,
    })

    const styleProfile = await getStyleProfile()
    const styleContext = buildStyleContext(styleProfile) ?? undefined

    const runPlatform = async (platform: string) => {
      set(state => ({
        progressivePlatforms: { ...state.progressivePlatforms, [platform]: 'loading' }
      }))
      try {
        const { content } = await generateSinglePlatform(
          platform,
          input.trim(),
          tone !== 'auto' ? tone : undefined,
          undefined,
          styleContext
        )
        set(state => ({
          progressivePlatforms: { ...state.progressivePlatforms, [platform]: 'done' },
          result: state.result ? {
            ...state.result,
            platforms: {
              ...state.result.platforms,
              [platform]: content,
            }
          } : null,
        }))
      } catch {
        set(state => ({
          progressivePlatforms: { ...state.progressivePlatforms, [platform]: 'error' }
        }))
      }
    }

    await runPlatform(ordered[0])
    set({ loading: false })
    ordered.slice(1).forEach(platform => runPlatform(platform))

    const updated = [input.trim(), ...recentIdeas.filter(i => i !== input.trim())].slice(0, MAX_RECENT)
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
    set({ recentIdeas: updated })
    const donePlatforms = ordered.filter(p => get().progressivePlatforms[p] === 'done')
    trackGeneration(donePlatforms).catch(() => {})
    const finalResult = get().result
    if (finalResult) await cacheResult(input.trim(), tone, finalResult)
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
    mediaUri: null,
  mediaType: null,
  setMedia: (uri, type) => set({ mediaUri: uri, mediaType: type }),
  mediaFilter: 'original',
  setMediaFilter: (filter) => set({ mediaFilter: filter }),
  result: null,
    loading: false,
    error: null,
    progressivePlatforms: {},
  })
}))
