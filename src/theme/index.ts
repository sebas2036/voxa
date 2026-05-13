import { useColorScheme } from 'react-native'
import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const darkTheme = {
  mode: 'dark' as const,
  bg: '#0a0a0a',
  bgSecondary: '#111',
  bgTertiary: '#1a1a1a',
  border: '#1e1e1e',
  borderActive: '#c8b99a',
  text: '#f0ede8',
  textSecondary: '#aaa',
  textMuted: '#666',
  textDisabled: '#333',
  accent: '#c8b99a',
  accentLight: '#c8b99a12',
  success: '#4caf7d',
  error: '#e05a4e',
  recordActive: '#e05a4e',
}

export const lightTheme = {
  mode: 'light' as const,
  bg: '#f5f0eb',
  bgSecondary: '#ffffff',
  bgTertiary: '#ece8e2',
  border: '#ddd8d2',
  borderActive: '#9a8a6a',
  text: '#1a1a1a',
  textSecondary: '#555',
  textMuted: '#999',
  textDisabled: '#bbb',
  accent: '#9a8a6a',
  accentLight: '#9a8a6a12',
  success: '#2e7d52',
  error: '#c0392b',
  recordActive: '#c0392b',
}

export type Theme = typeof darkTheme
export type ThemePreference = 'auto' | 'light' | 'dark'

const THEME_KEY = 'voxa_theme_preference'

let _preference: ThemePreference = 'auto'
let _listeners: Array<() => void> = []

export async function loadThemePreference(): Promise<ThemePreference> {
  try {
    const stored = await AsyncStorage.getItem(THEME_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'auto') {
      _preference = stored
    }
  } catch {}
  return _preference
}

export async function setThemePreference(pref: ThemePreference) {
  _preference = pref
  try { await AsyncStorage.setItem(THEME_KEY, pref) } catch {}
  _listeners.forEach(fn => fn())
}

export function getThemePreference(): ThemePreference {
  return _preference
}

export function useTheme(): Theme & { preference: ThemePreference } {
  const systemScheme = useColorScheme()
  const [preference, setPreference] = useState<ThemePreference>(_preference)

  useEffect(() => {
    loadThemePreference().then(p => setPreference(p))
    const listener = () => setPreference(getThemePreference())
    _listeners.push(listener)
    return () => { _listeners = _listeners.filter(l => l !== listener) }
  }, [])

  const resolved = preference === 'auto'
    ? (systemScheme === 'light' ? lightTheme : darkTheme)
    : (preference === 'light' ? lightTheme : darkTheme)

  return { ...resolved, preference }
}
