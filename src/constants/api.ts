// El backend va por el túnel (localtunnel) para que los OAuth callbacks vuelvan via HTTPS público.
// Para overridear: EXPO_PUBLIC_API_URL=http://<IP-LAN>:3000 en .env del root.
export const API_URL: string = process.env.EXPO_PUBLIC_API_URL || 'https://remedy-ranging-admission-composer.trycloudflare.com'
