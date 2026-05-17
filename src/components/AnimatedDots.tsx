import React, { useRef, useEffect } from 'react'
import { View, Animated } from 'react-native'

export function AnimatedDots({ color }: { color: string }) {
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
        <Animated.View key={i} style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color + '99', transform: [{ translateY: anim }] }} />
      ))}
    </View>
  )
}
