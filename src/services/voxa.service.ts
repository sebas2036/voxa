import { API_URL } from '../constants/api'

export interface VoxaResult {
  detectedLanguage: 'spanish' | 'english'
  analysis: {
    topic: string
    emotion: string
    intent: string
    audience: string
    contentType: string
  }
  platforms: {
    twitter: { content: string; charCount: number }
    linkedin: { content: string; wordCount: number }
    threads: { content: string; charCount: number }
    instagram: { content: string; hashtags: string[] }
  }
  recommendation: {
    bestPlatform: string
    bestDay: string
    bestTime: string
    reason: string
  }
}

const PLATFORM_SPEED_ORDER = ['twitter', 'threads', 'instagram', 'linkedin']

export function getPlatformGenerationOrder(platforms: string[]): string[] {
  return [...platforms].sort((a, b) => {
    const rankA = PLATFORM_SPEED_ORDER.indexOf(a)
    const rankB = PLATFORM_SPEED_ORDER.indexOf(b)
    return (rankA === -1 ? 99 : rankA) - (rankB === -1 ? 99 : rankB)
  })
}

export async function generateContent(
  input: string,
  tone?: string
): Promise<VoxaResult> {
  const response = await fetch(`${API_URL}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input, tone })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error generando contenido')
  }

  return response.json()
}

export async function generateSinglePlatform(
  platform: string,
  input: string,
  tone?: string
): Promise<{ platform: string; content: VoxaResult['platforms'][keyof VoxaResult['platforms']] }> {
  const response = await fetch(`${API_URL}/generate-single`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform, input, tone })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || `Error generando ${platform}`)
  }

  return response.json()
}