import 'react-native-url-polyfill/auto'
import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { View, ActivityIndicator } from 'react-native'
import * as Linking from 'expo-linking'
import { initAppManagement } from './src/utils/appDetection'
import CaptureScreen from './src/screens/CaptureScreen'
import ReviewScreen from './src/screens/ReviewScreen'
import DevScreen from './src/screens/DevScreen'
import PrivacyScreen from './src/screens/PrivacyScreen'
import ConfirmScreen from './src/screens/ConfirmScreen'
import SettingsScreen from './src/screens/SettingsScreen'
import AppsScreen from './src/screens/AppsScreen'
import TermsScreen from './src/screens/TermsScreen'
import FAQScreen from './src/screens/FAQScreen'
import AuthScreen from './src/screens/AuthScreen'
import { supabase } from './src/lib/supabase'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { saveTokens } from './src/lib/tokenStorage'
import { getProvider } from './src/constants/providers'

const Stack = createStackNavigator()

// glosx://auth/<provider>?access_token=...&refresh_token=...&expires_in=...&extra=...
async function handleOAuthDeepLink(url: string) {
  if (!url.startsWith('glosx://auth/')) return
  const parsed = Linking.parse(url)
  const path = parsed.path || ''
  const providerId = path.replace(/^auth\//, '').split('/')[0]
  if (!getProvider(providerId)) return
  const q = (parsed.queryParams || {}) as Record<string, string>
  if (q.error || !q.access_token) return
  const expiresIn = q.expires_in ? parseInt(q.expires_in, 10) : undefined
  let extra: Record<string, any> | undefined
  if (q.extra) { try { extra = JSON.parse(q.extra) } catch {} }
  await saveTokens(providerId as any, {
    accessToken: q.access_token,
    refreshToken: q.refresh_token || undefined,
    expiresAt: expiresIn ? Date.now() + expiresIn * 1000 : undefined,
    extra,
  })
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null)

  useEffect(() => {
    Linking.getInitialURL().then(url => { if (url) handleOAuthDeepLink(url) })
    initAppManagement()
    const sub = Linking.addEventListener('url', ({ url }) => handleOAuthDeepLink(url))
    return () => sub.remove()
  }, [])

  useEffect(() => {
    // Migración: limpiar storage legacy (vox_* y twitter_* sueltos)
    AsyncStorage.multiRemove([
      'vox_enabled_platforms', 'vox_extra_platforms', 'vox_app_management',
      'twitter_access_token', 'twitter_refresh_token', 'twitter_code_verifier', 'twitter_state',
    ])
    AsyncStorage.getItem('glosx_app_management').then(val => {
      const mgmt = val ? JSON.parse(val) : {}
      const predefined = ['twitter', 'threads', 'instagram', 'reddit']
      let changed = false
      predefined.forEach(k => { if (mgmt[k] === undefined || mgmt[k] === false) { mgmt[k] = true; changed = true } })
      if (changed) AsyncStorage.setItem('glosx_app_management', JSON.stringify(mgmt))
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      setInitialRoute(session ? 'Capture' : 'Auth')
    })
  }, [])

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#c8b99a" />
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: ({ current, layouts }) => ({
            cardStyle: {
              opacity: current.progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
              transform: [{
                translateX: current.progress.interpolate({ inputRange: [0, 1], outputRange: [layouts.screen.width * 0.04, 0] })
              }]
            }
          }),
          transitionSpec: {
            open: { animation: 'spring', config: { stiffness: 280, damping: 32, mass: 0.8 } },
            close: { animation: 'spring', config: { stiffness: 280, damping: 32, mass: 0.8 } },
          }
        }}
        initialRouteName={initialRoute}
      >
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Capture" component={CaptureScreen} />
        <Stack.Screen name="Review" component={ReviewScreen} options={{
          cardStyleInterpolator: ({ current, layouts }) => ({
            cardStyle: {
              opacity: current.progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
              transform: [{
                translateY: current.progress.interpolate({ inputRange: [0, 1], outputRange: [layouts.screen.height * 0.06, 0] })
              }]
            }
          })
        }} />
        <Stack.Screen name="Confirm" component={ConfirmScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Apps" component={AppsScreen} />
        <Stack.Screen name="Terms" component={TermsScreen} />
        <Stack.Screen name="FAQ" component={FAQScreen} />
        <Stack.Screen name="Dev" component={DevScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
