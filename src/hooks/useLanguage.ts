import { getLocales } from 'expo-localization'
import { translations } from '../i18n/translations'

export function useLanguage() {
  const locale = getLocales()[0]?.languageCode ?? 'es'
  const lang = locale.startsWith('en') ? 'en' : 'es'
  const t = translations[lang]
  return { lang, t }
}
