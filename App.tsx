import 'react-native-url-polyfill/auto'
import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { View, ActivityIndicator } from 'react-native'
import * as Linking from 'expo-linking'
import { initAppManagement } from './src/utils/appDetection'
import CaptureScreen from './src/screens/CaptureScreen'
import ReviewScreen from './src/screens/ReviewScreen'
import ConfirmScreen from './src/screens/ConfirmScreen'
import SettingsScreen from './src/screens/SettingsScreen'
import AppsScreen from './src/screens/AppsScreen'
import TermsScreen from './src/screens/TermsScreen'
import FAQScreen from './src/screens/FAQScreen'
import AuthScreen from './src/screens/AuthScreen'
import { supabase } from './src/lib/supabase'
import AsyncStorage from '@react-native-async-storage/async-storage'

const Stack = createStackNavigator()

export default function App() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null)

  useEffect(() => {
    // Handler deep links OAuth
    const handleDeepLink = async (url: string) => {
      if (url.startsWith('voxa://auth/twitter')) {
        const parsed = Linking.parse(url)
        const code = parsed.queryParams?.code as string
        if (code) {
          const codeVerifier = await AsyncStorage.getItem('twitter_code_verifier')
          try {
            const res = await fetch('http://192.168.0.23:3000/auth/twitter/callback', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code, codeVerifier })
            })
            const data = await res.json()
            if (data.accessToken) {
              await AsyncStorage.setItem('twitter_access_token', data.accessToken)
              if (data.refreshToken) await AsyncStorage.setItem('twitter_refresh_token', data.refreshToken)
            }
          } catch (e) {
            console.error('Twitter callback error:', e)
          }
        }
      }
    }

    Linking.getInitialURL().then(url => { if (url) handleDeepLink(url) })
    initAppManagement()
    const sub = Linking.addEventListener('url', ({ url }) => handleDeepLink(url))
    return () => sub.remove()
  }, [])

  useEffect(() => {
    // Migración: limpiar storage corrupto
    AsyncStorage.multiRemove(['vox_enabled_platforms', 'vox_extra_platforms'])
    AsyncStorage.getItem('vox_app_management').then(val => {
      const mgmt = val ? JSON.parse(val) : {}
      const predefined = ['twitter', 'threads', 'instagram', 'reddit']
      let changed = false
      predefined.forEach(k => { if (mgmt[k] === undefined || mgmt[k] === false) { mgmt[k] = true; changed = true } })
      if (changed) AsyncStorage.setItem('vox_app_management', JSON.stringify(mgmt))
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
      </Stack.Navigator>
    </NavigationContainer>
  )
}
