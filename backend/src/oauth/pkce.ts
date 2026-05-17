import crypto from 'crypto'

function base64Url(buf: Buffer): string {
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

export function generateCodeVerifier(): string {
  return base64Url(crypto.randomBytes(32))
}

export function codeChallengeFromVerifier(verifier: string): string {
  return base64Url(crypto.createHash('sha256').update(verifier).digest())
}

export function generateState(): string {
  return base64Url(crypto.randomBytes(16))
}
