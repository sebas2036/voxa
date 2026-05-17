import React, { useRef, useEffect } from 'react'
import { View, Animated, TouchableOpacity, StyleSheet, Easing } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export type MicState = 'idle' | 'recording' | 'thinking' | 'generating' | 'ready'

export const MIC_STATES = {
  idle:       { color: '#c8b99a', pulseSpeed: 2400, pulseScale: 1.8 },
  recording:  { color: '#ff3b30', pulseSpeed: 800,  pulseScale: 2.2 },
  thinking:   { color: '#4a9eff', pulseSpeed: 1200, pulseScale: 2.0 },
  generating: { color: '#2e7d52', pulseSpeed: 1600, pulseScale: 2.6 },
  ready:      { color: '#c8b99a', pulseSpeed: 400,  pulseScale: 1.4 },
}

interface MicButtonProps {
  micState: MicState
  onPress: () => void
  bgColor: string
}

export function MicButton({ micState, onPress, bgColor }: MicButtonProps) {
  const ring1 = useRef(new Animated.Value(0)).current
  const ring2 = useRef(new Animated.Value(0)).current
  const ring3 = useRef(new Animated.Value(0)).current

  const animateRing = (anim: Animated.Value, delay: number, speed: number) =>
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: speed, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    )

  const makeRingStyle = (anim: Animated.Value) => ({
    opacity: anim.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.25, 0] }),
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.8] }) }]
  })

  useEffect(() => {
    const speed = MIC_STATES[micState].pulseSpeed
    const delay = speed / 3
    if (micState !== 'idle') {
      animateRing(ring1, 0, speed).start()
      animateRing(ring2, delay, speed).start()
      animateRing(ring3, delay * 2, speed).start()
    } else {
      ring1.stopAnimation(); ring1.setValue(0)
      ring2.stopAnimation(); ring2.setValue(0)
      ring3.stopAnimation(); ring3.setValue(0)
    }
  }, [micState])

  const color = MIC_STATES[micState].color

  return (
    <View style={s.micWrapper}>
      <Animated.View style={[s.ring, { backgroundColor: color }, makeRingStyle(ring1)]} />
      <Animated.View style={[s.ring, { backgroundColor: color }, makeRingStyle(ring2)]} />
      <Animated.View style={[s.ring, { backgroundColor: color }, makeRingStyle(ring3)]} />
      <TouchableOpacity style={[s.micBtn, { backgroundColor: color }]} onPress={onPress} activeOpacity={0.85}>
        <Ionicons name={micState === 'recording' ? 'stop' : 'mic'} size={38} color={bgColor} />
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  micWrapper: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 120, height: 120, borderRadius: 60 },
  micBtn: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
})
