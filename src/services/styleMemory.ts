import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = 'glosx:style_profile'

export interface StyleProfile {
  lengthPreference: 'short' | 'medium' | 'long' | null   // promedio de chars editados
  toneSignals: string[]                                    // palabras clave del estilo
  emojiUsage: 'none' | 'moderate' | 'frequent' | null    // frecuencia de emojis
  avgEdits: number                                         // cuántas veces editó
  sampleTexts: string[]                                    // últimos 5 textos guardados
  updatedAt: number
}

const DEFAULT: StyleProfile = {
  lengthPreference: null,
  toneSignals: [],
  emojiUsage: null,
  avgEdits: 0,
  sampleTexts: [],
  updatedAt: 0,
}

export async function getStyleProfile(): Promise<StyleProfile> {
  try {
    const raw = await AsyncStorage.getItem(KEY)
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT
  } catch { return DEFAULT }
}

export async function updateStyleProfile(editedText: string): Promise<void> {
  try {
    const profile = await getStyleProfile()

    // Length preference
    const len = editedText.length
    const lengthPreference = len < 120 ? 'short' : len < 400 ? 'medium' : 'long'

    // Emoji usage
    const emojiCount = (editedText.match(/\p{Emoji}/gu) || []).length
    const emojiUsage = emojiCount === 0 ? 'none' : emojiCount <= 2 ? 'moderate' : 'frequent'

    // Sample texts (últimos 5)
    const sampleTexts = [editedText, ...profile.sampleTexts].slice(0, 5)

    // Tone signals: palabras de 5+ chars, sin stopwords
    const stopwords = new Set(['para','como','pero','que','con','una','los','las','del','por','más','sobre','este','esta','cuando','donde'])
    const words = editedText.toLowerCase().match(/\b[a-záéíóúñ]{5,}\b/g) || []
    const newSignals = words.filter(w => !stopwords.has(w))
    const toneSignals = [...new Set([...newSignals, ...profile.toneSignals])].slice(0, 30)

    const updated: StyleProfile = {
      lengthPreference,
      toneSignals,
      emojiUsage,
      avgEdits: profile.avgEdits + 1,
      sampleTexts,
      updatedAt: Date.now(),
    }

    await AsyncStorage.setItem(KEY, JSON.stringify(updated))
  } catch {}
}

export function buildStyleContext(profile: StyleProfile): string | null {
  if (profile.avgEdits === 0) return null

  const parts: string[] = []

  if (profile.lengthPreference === 'short') parts.push('respuestas cortas y directas')
  else if (profile.lengthPreference === 'medium') parts.push('respuestas de largo medio')
  else if (profile.lengthPreference === 'long') parts.push('contenido detallado y extenso')

  if (profile.emojiUsage === 'none') parts.push('sin emojis')
  else if (profile.emojiUsage === 'moderate') parts.push('con emojis moderados')
  else if (profile.emojiUsage === 'frequent') parts.push('con varios emojis')

  if (profile.toneSignals.length > 0) {
    parts.push(`vocabulario frecuente del usuario: ${profile.toneSignals.slice(0,10).join(', ')}`)
  }

  if (profile.sampleTexts.length > 0) {
    parts.push(`ejemplo de su estilo: "${profile.sampleTexts[0].slice(0, 150)}"`)
  }

  return `Adapta el contenido al estilo del usuario: ${parts.join('. ')}.`
}
