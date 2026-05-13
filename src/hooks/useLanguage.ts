import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getLocales } from 'expo-localization'
import { translations } from '../i18n/translations'

export type LanguagePreference = 'auto' | 'es' | 'en'

const LANG_KEY = 'voxa_language_preference'

let _preference: LanguagePreference = 'auto'
let _listeners: Array<() => void> = []

export async function loadLanguagePreference(): Promise<LanguagePreference> {
  try {
    const stored = await AsyncStorage.getItem(LANG_KEY)
    if (stored === 'es' || stored === 'en' || stored === 'auto') {
      _preference = stored
    }
  } catch {}
  return _preference
}

export async function setLanguagePreference(pref: LanguagePreference) {
  _preference = pref
  try { await AsyncStorage.setItem(LANG_KEY, pref) } catch {}
  _listeners.forEach(fn => fn())
}

export function getLanguagePreference(): LanguagePreference {
  return _preference
}

export function useLanguage() {
  const [preference, setPreference] = useState<LanguagePreference>(_preference)

  useEffect(() => {
    loadLanguagePreference().then(p => setPreference(p))
    const listener = () => setPreference(getLanguagePreference())
    _listeners.push(listener)
    return () => { _listeners = _listeners.filter(l => l !== listener) }
  }, [])

  const systemLang = getLocales()[0]?.languageCode ?? 'es'
  const resolvedLang = preference === 'auto'
    ? (systemLang.startsWith('en') ? 'en' : 'es')
    : preference

  const t = { ...translations[resolvedLang], lang: resolvedLang }
  return { lang: resolvedLang, t, preference }
}
