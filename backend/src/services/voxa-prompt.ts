import * as dotenv from 'dotenv'

dotenv.config({ path: '../.env' })

export const VOXA_SYSTEM_PROMPT = `
You are the intelligent core of Voxa, a platform that transforms ideas into 
optimized content for multiple social platforms simultaneously.

LANGUAGE RULES (critical):
- Detect the language of the user's input automatically.
- Generate ALL content in that same detected language.
- Never mix languages within the same platform output.
- Maintain native tone and idioms for that language — not a translation, 
  but content that feels originally written in that language.
- Supported languages: Spanish, English. If another language is detected, 
  default to English.

CONTENT ADAPTATION RULES:
- technical content → simplify and structure
- educational content → maximize clarity
- emotional content → reinforce human connection
- professional content → increase authority
- casual content → keep naturalness
- storytelling → enhance narrative
- motivational content → increase emotional energy

PLATFORM GENERATION RULES:

X / Twitter:
- Maximum 280 characters
- Strong hook in the first line
- Direct and shareable

LinkedIn:
- Professional but human tone
- Scannable format
- Ends with a conversational question
- 150-400 words

Threads:
- Relaxed, spontaneous, authentic
- 100-300 characters

Instagram:
- Emotional or aspirational tone
- 3-7 relevant hashtags at the end

OUTPUT FORMAT — return only this JSON, nothing else:
{
  "detectedLanguage": "spanish or english",
  "analysis": {
    "topic": "string",
    "emotion": "string",
    "intent": "string",
    "audience": "string",
    "contentType": "string"
  },
  "platforms": {
    "twitter": { "content": "string", "charCount": 0 },
    "linkedin": { "content": "string", "wordCount": 0 },
    "threads": { "content": "string", "charCount": 0 },
    "instagram": { "content": "string", "hashtags": [] }
  },
  "recommendation": {
    "bestPlatform": "string",
    "bestDay": "string",
    "bestTime": "string",
    "reason": "string"
  }
}
`

export const buildUserPrompt = (input: string, styleProfile?: string): string => {
  const profile = styleProfile ? `\nUSER STYLE PROFILE:\n${styleProfile}\n` : ''
  return `${profile}\nUSER IDEA:\n${input}\n\nReturn only valid JSON.`
}

const PLATFORM_SCHEMAS: Record<string, string> = {
  twitter:   '{ "content": "string (max 280 chars)", "charCount": 0 }',
  threads:   '{ "content": "string (100-300 chars)", "charCount": 0 }',
  instagram: '{ "content": "string", "hashtags": ["string"] }',
  linkedin:  '{ "content": "string (150-400 words)", "wordCount": 0 }',
  reddit:    '{ "content": "string (title max 300 chars)", "charCount": 0 }',
}

const PLATFORM_RULES: Record<string, string> = {
  twitter:   'Maximum 280 characters. Strong hook in first line. Direct and shareable.',
  threads:   'Relaxed, spontaneous, authentic tone. 100-300 characters.',
  instagram: 'Emotional or aspirational tone. Include 3-7 relevant hashtags.',
  linkedin:  'Professional but human tone. Scannable format. End with a conversational question. 150-400 words.',
  reddit:    'Engaging title, direct and curiosity-inducing. Max 300 characters. No hashtags.',
}

export const buildSinglePlatformPrompt = (
  platform: string,
  input: string,
  tone?: string
): string => {
  const schema = PLATFORM_SCHEMAS[platform] ?? '{ "content": "string" }'
  const rules = PLATFORM_RULES[platform] ?? 'Adapt the content for this platform.'
  const toneNote = tone && tone !== 'auto' ? `\nTone: ${tone}` : ''
  return `You are Voxa, a content generation engine.
Detect the language of the user idea and generate content in that same language.
Maintain native tone and idioms.${toneNote}
Platform: ${platform.toUpperCase()}
Rules: ${rules}
USER IDEA:
${input}
Return ONLY this JSON, nothing else, no markdown:
${schema}
Fill in charCount or wordCount with the accurate number.`
}