import { useState } from 'react'
import * as Linking from 'expo-linking'
import AsyncStorage from '@react-native-async-storage/async-storage'

const API = 'http://192.168.0.23:3000'

export function useTwitterAuth() {
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(false)

  const connect = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/twitter`)
      const { url, codeVerifier, state } = await res.json()
      await AsyncStorage.setItem('twitter_code_verifier', codeVerifier)
      await AsyncStorage.setItem('twitter_state', state)
      await Linking.openURL(url)
    } catch (e) {
      console.error('Twitter auth error:', e)
    }
    setLoading(false)
  }

  const handleCallback = async (code: string) => {
    try {
      const codeVerifier = await AsyncStorage.getItem('twitter_code_verifier')
      const res = await fetch(`${API}/auth/twitter/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, codeVerifier })
      })
      const { accessToken, refreshToken } = await res.json()
      if (accessToken) {
        await AsyncStorage.setItem('twitter_access_token', accessToken)
        if (refreshToken) await AsyncStorage.setItem('twitter_refresh_token', refreshToken)
        setConnected(true)
        return true
      }
    } catch (e) {
      console.error('Twitter callback error:', e)
    }
    return false
  }

  const publish = async (content: string) => {
    const accessToken = await AsyncStorage.getItem('twitter_access_token')
    if (!accessToken) return false
    try {
      const res = await fetch(`${API}/publish/twitter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, content })
      })
      const data = await res.json()
      return data.success === true
    } catch (e) {
      return false
    }
  }

  const isConnected = async () => {
    const token = await AsyncStorage.getItem('twitter_access_token')
    setConnected(!!token)
    return !!token
  }

  const disconnect = async () => {
    await AsyncStorage.removeItem('twitter_access_token')
    await AsyncStorage.removeItem('twitter_refresh_token')
    setConnected(false)
  }

  return { connect, handleCallback, publish, isConnected, disconnect, loading, connected }
}
