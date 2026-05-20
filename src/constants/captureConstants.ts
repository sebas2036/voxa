export const ALL_PLATFORM_ICONS: Record<string, { icon: string, lib: string, color: string, name: string }> = {
  twitter:   { icon: 'x-twitter', lib: 'fa6', color: '#888888', name: 'X' },
  linkedin:  { icon: 'linkedin',  lib: 'fa5', color: '#4a9eff', name: 'LinkedIn' },
  threads:   { icon: 'T',         lib: 'text', color: '#444444', name: 'Threads' },
  instagram: { icon: 'instagram', lib: 'fa5', color: '#e1306c', name: 'Instagram' },
  whatsapp:  { icon: 'whatsapp',  lib: 'fa5', color: '#25D366', name: 'WhatsApp' },
  telegram:  { icon: 'telegram',  lib: 'fa5', color: '#2AABEE', name: 'Telegram' },
  tiktok:    { icon: 'tiktok',    lib: 'fa6', color: '#333333', name: 'TikTok' },
  facebook:  { icon: 'facebook',  lib: 'fa5', color: '#1877F2', name: 'Facebook' },
  pinterest: { icon: 'pinterest', lib: 'fa5', color: '#E60023', name: 'Pinterest' },
  reddit:    { icon: 'reddit',    lib: 'fa5', color: '#FF4500', name: 'Reddit' },
}

export const HINTS_MAP: Record<string, string[]> = {
  es: ['hablá', 'revisá', 'publicá'],
  en: ['speak', 'review', 'publish'],
  zh: ['说', '审阅', '发布'],
  pt: ['fale', 'revise', 'publique'],
  fr: ['parlez', 'révisez', 'publiez'],
  de: ['sprechen', 'überprüfen', 'veröffentlichen'],
  ja: ['話す', 'レビュー', '投稿'],
  it: ['parla', 'rivedi', 'pubblica'],
}

export const MIC_STATES = {
  idle:       { color: '#c8b99a', hints_es: ['hablá', 'escribí', 'contame'],            hints_en: ['speak', 'write', 'tell me'] },
  recording:  { color: '#ff3b30', hints_es: ['escuchando...', 'seguí hablando...'],      hints_en: ['listening...', 'keep talking...'] },
  thinking:   { color: '#4a9eff', hints_es: ['procesando...', 'pensando...'],            hints_en: ['processing...', 'thinking...'] },
  generating: { color: '#2e7d52', hints_es: ['armando tu historia...', 'casi listo...'], hints_en: ['building your story...', 'almost there...'] },
  ready:      { color: '#c8b99a', hints_es: ['listo ✓'],                                 hints_en: ['ready ✓'] },
}
