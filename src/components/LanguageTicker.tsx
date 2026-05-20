import React, { useRef, useEffect, useState } from 'react'
import { Animated } from 'react-native'

const TICKER_PHRASES = [
  'tu voz, en todas tus redes',
  'your voice, on every network',
  'ta voix, sur tous tes réseaux',
  'deine stimme, überall',
  'sua voz, em todas as redes',
  'la tua voce, ovunque',
  '你的声音，遍及每个网络',
  'あなたの声を、世界へ',
]

export function LanguageTicker({ theme }: { theme: any }) {
  const [index, setIndex] = useState(0)
  const opacity = useRef(new Animated.Value(1)).current

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]).start()
      setTimeout(() => setIndex(i => (i + 1) % TICKER_PHRASES.length), 500)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Animated.Text numberOfLines={1} style={{
      fontSize: 11, letterSpacing: 2, textAlign: 'center',
      color: theme.textMuted, opacity,
    }}>
      {TICKER_PHRASES[index]}
    </Animated.Text>
  )
}
