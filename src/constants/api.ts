// Para overridear poné EXPO_PUBLIC_API_URL=http://<IP-LAN>:3000 en .env del root
export const API_URL: string = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.23:3000'
