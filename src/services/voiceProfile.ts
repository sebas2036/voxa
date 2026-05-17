import AsyncStorage from '@react-native-async-storage/async-storage'

const PROFILE_KEY = 'GlosX_voice_profile'

export interface VoiceProfile {
  preferredTones: Record<string, number>  // tono -> cantidad de veces usado
  editPatterns: string[]                   // palabras que el usuario agrega
  preferredPlatforms: Record<string, number> // plataforma -> cantidad de usos
  totalGenerations: number
}

const DEFAULT_PROFILE: VoiceProfile = {
  preferredTones: {},
  editPatterns: [],
  preferredPlatforms: {},
  totalGenerations: 0,
}

export async function getVoiceProfile(): Promise<VoiceProfile> {
  try {
    const stored = await AsyncStorage.getItem(PROFILE_KEY)
    return stored ? JSON.parse(stored) : DEFAULT_PROFILE
  } catch {
    return DEFAULT_PROFILE
  }
}

export async function trackTone(tone: string) {
  if (tone === 'auto') return
  const profile = await getVoiceProfile()
  profile.preferredTones[tone] = (profile.preferredTones[tone] || 0) + 1
  profile.totalGenerations++
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export async function trackPlatform(platformKey: string) {
  const profile = await getVoiceProfile()
  profile.preferredPlatforms[platformKey] = (profile.preferredPlatforms[platformKey] || 0) + 1
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export async function trackEdit(original: string, edited: string) {
  if (original === edited) return
  const profile = await getVoiceProfile()
  const editedWords = edited.split(' ').filter(w => !original.includes(w))
  profile.editPatterns = [...profile.editPatterns, ...editedWords].slice(-50)
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export function buildVoiceProfilePrompt(profile: VoiceProfile): string {
  if (profile.totalGenerations < 3) return ''
  
  const parts: string[] = []
  
  // Tono preferido
  const topTone = Object.entries(profile.preferredTones)
    .sort((a, b) => b[1] - a[1])[0]
  if (topTone) parts.push(`Preferred tone: ${topTone[0]}`)
  
  // Plataformas preferidas
  const topPlatforms = Object.entries(profile.preferredPlatforms)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => k)
  if (topPlatforms.length) parts.push(`Main platforms: ${topPlatforms.join(', ')}`)
  
  // Palabras frecuentes en ediciones
  if (profile.editPatterns.length > 5) {
    const freq: Record<string, number> = {}
    profile.editPatterns.forEach(w => { freq[w] = (freq[w] || 0) + 1 })
    const topWords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([w]) => w)
    parts.push(`User vocabulary style: ${topWords.join(', ')}`)
  }
  
  if (!parts.length) return ''
  return `\nUSER VOICE PROFILE (adapt content to match this style):\n${parts.join('\n')}`
}
