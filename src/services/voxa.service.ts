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
