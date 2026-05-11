import 'react-native-url-polyfill/auto'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import CaptureScreen from './src/screens/CaptureScreen'
import ReviewScreen from './src/screens/ReviewScreen'
import ConfirmScreen from './src/screens/ConfirmScreen'

const Stack = createStackNavigator()

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Capture" component={CaptureScreen} />
        <Stack.Screen name="Review" component={ReviewScreen} />
        <Stack.Screen name="Confirm" component={ConfirmScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
