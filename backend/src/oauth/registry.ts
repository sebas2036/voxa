import { OAuthProvider, ProviderId } from './types'
import { twitterProvider } from './providers/twitter'
import { redditProvider } from './providers/reddit'
import { linkedinProvider } from './providers/linkedin'
import { pinterestProvider } from './providers/pinterest'
import { tiktokProvider } from './providers/tiktok'
import { facebookProvider } from './providers/facebook'

const providers: Record<ProviderId, OAuthProvider> = {
  twitter: twitterProvider,
  reddit: redditProvider,
  linkedin: linkedinProvider,
  pinterest: pinterestProvider,
  tiktok: tiktokProvider,
  facebook: facebookProvider,
}

export function getProvider(id: string): OAuthProvider | null {
  return (providers as any)[id] || null
}

export function listProviders(): OAuthProvider[] {
  return Object.values(providers)
}
