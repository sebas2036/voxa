import 'react-native-url-polyfill/auto'
import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { View, ActivityIndicator } from 'react-native'
import CaptureScreen from './src/screens/CaptureScreen'
import ReviewScreen from './src/screens/ReviewScreen'
import ConfirmScreen from './src/screens/ConfirmScreen'
import SettingsScreen from './src/screens/SettingsScreen'
import AppsScreen from './src/screens/AppsScreen'
import AuthScreen from './src/screens/AuthScreen'
import { supabase } from './src/lib/supabase'
import AsyncStorage from '@react-native-async-storage/async-storage'

const Stack = createStackNavigator()

export default function App() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null)

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
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Capture" component={CaptureScreen} />
        <Stack.Screen name="Review" component={ReviewScreen} />
        <Stack.Screen name="Confirm" component={ConfirmScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Apps" component={AppsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
