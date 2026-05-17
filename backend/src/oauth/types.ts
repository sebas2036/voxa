export type ProviderId = 'twitter' | 'reddit' | 'linkedin' | 'pinterest' | 'tiktok' | 'facebook'

export interface AuthUrlResult {
  url: string
  state: string
  codeVerifier?: string
}

export interface TokenResult {
  accessToken: string
  refreshToken?: string
  expiresIn?: number
  extra?: Record<string, any>
}

export interface PublishResult {
  success: boolean
  id?: string
  url?: string
  error?: string
}

export interface OAuthProvider {
  id: ProviderId
  usesPKCE: boolean
  isConfigured(): boolean
  buildAuthUrl(redirectUri: string, state: string, codeVerifier?: string): string
  exchangeCode(args: {
    code: string
    redirectUri: string
    codeVerifier?: string
  }): Promise<TokenResult>
  refresh?(refreshToken: string): Promise<TokenResult>
  publish(args: {
    accessToken: string
    content: string
    extra?: Record<string, any>
  }): Promise<PublishResult>
}
