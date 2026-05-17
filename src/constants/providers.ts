export type ProviderId =
  | 'twitter' | 'reddit' | 'linkedin' | 'pinterest' | 'tiktok' | 'facebook'
  | 'instagram' | 'threads' | 'whatsapp' | 'telegram'

export interface ProviderMeta {
  id: ProviderId
  name: string
  // si tiene OAuth de posting via API (vs solo deep link al app nativa)
  hasOAuth: boolean
  // deep link como fallback / post-publish redirect
  deepLink?: (content: string) => string
  fallbackUrl?: string
  // si requiere media (no se publica solo texto)
  requiresMedia?: boolean
}

export const PROVIDERS: Record<ProviderId, ProviderMeta> = {
  twitter: {
    id: 'twitter',
    name: 'X',
    hasOAuth: true,
    deepLink: (c) => `twitter://post?message=${encodeURIComponent(c)}`,
    fallbackUrl: 'https://twitter.com/intent/tweet',
  },
  reddit: {
    id: 'reddit',
    name: 'Reddit',
    hasOAuth: true,
    deepLink: (c) => `reddit://submit?title=${encodeURIComponent(c)}`,
    fallbackUrl: 'https://www.reddit.com/submit',
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    hasOAuth: true,
    deepLink: () => 'linkedin://shareArticle',
    fallbackUrl: 'https://www.linkedin.com/feed/',
  },
  pinterest: {
    id: 'pinterest',
    name: 'Pinterest',
    hasOAuth: true,
    requiresMedia: true,
    deepLink: () => 'pinterest://',
    fallbackUrl: 'https://www.pinterest.com',
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    hasOAuth: true,
    requiresMedia: true,
    deepLink: () => 'tiktok://',
    fallbackUrl: 'https://www.tiktok.com',
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    hasOAuth: true,
    deepLink: () => 'fb://',
    fallbackUrl: 'https://www.facebook.com',
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    hasOAuth: false,
    deepLink: () => 'instagram://library',
    fallbackUrl: 'https://www.instagram.com',
  },
  threads: {
    id: 'threads',
    name: 'Threads',
    hasOAuth: false,
    deepLink: (c) => `barcelona://create?text=${encodeURIComponent(c)}`,
    fallbackUrl: 'https://www.threads.net',
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp',
    hasOAuth: false,
    deepLink: (c) => `whatsapp://send?text=${encodeURIComponent(c)}`,
    fallbackUrl: 'https://wa.me/',
  },
  telegram: {
    id: 'telegram',
    name: 'Telegram',
    hasOAuth: false,
    deepLink: (c) => `tg://msg?text=${encodeURIComponent(c)}`,
    fallbackUrl: 'https://telegram.org',
  },
}

export function getProvider(id: string): ProviderMeta | null {
  return (PROVIDERS as any)[id] || null
}

export const OAUTH_PROVIDERS = Object.values(PROVIDERS).filter((p) => p.hasOAuth)
