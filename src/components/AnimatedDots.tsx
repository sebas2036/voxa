import React, { useRef, useEffect } from 'react'
import { View, Animated } from 'react-native'

const DARK_COLORS = ['#1a1a1a', '#333333', '#000000', '#444444', '#555555']

export function AnimatedDots({ color, fallbackColor }: { color: string; fallbackColor?: string }) {
  const anims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ]
  useEffect(() => {
    const animations = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(anim, { toValue: -3, duration: 400, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.delay(600),
        ])
      )
    )
    animations.forEach(a => a.start())
    return () => animations.forEach(a => a.stop())
  }, [])
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, flex: 1 }}>
      {anims.map((anim, i) => (
        <Animated.View key={i} style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: (DARK_COLORS.includes(color) ? (fallbackColor || '#888888') : color) + '99', transform: [{ translateY: anim }] }} />
      ))}
    </View>
  )
}
