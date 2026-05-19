import React, { useRef, useEffect } from 'react'
import { View, Animated, TouchableOpacity, StyleSheet, Easing } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export type MicState = 'idle' | 'recording' | 'thinking' | 'generating' | 'ready'

export const MIC_STATES = {
  idle:       { color: '#c8b99a', pulseSpeed: 3000 },
  recording:  { color: '#ff3b30', pulseSpeed: 900  },
  thinking:   { color: '#4a9eff', pulseSpeed: 2000 },
  generating: { color: '#2e7d52', pulseSpeed: 2400 },
  ready:      { color: '#c8b99a', pulseSpeed: 1200 },
}

interface MicButtonProps {
  micState: MicState
  onPress: () => void
  bgColor: string
}

export function MicButton({ micState, onPress, bgColor }: MicButtonProps) {
  const breath = useRef(new Animated.Value(0)).current
  const ring2  = useRef(new Animated.Value(0)).current
  const ring3  = useRef(new Animated.Value(0)).current

  useEffect(() => {
    breath.stopAnimation(); breath.setValue(0)
    ring2.stopAnimation();  ring2.setValue(0)
    ring3.stopAnimation();  ring3.setValue(0)

    if (micState === 'idle') return

    const speed = MIC_STATES[micState].pulseSpeed

    // Respiración principal — sube y baja suave
    Animated.loop(
      Animated.sequence([
        Animated.timing(breath, { toValue: 1, duration: speed, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(breath, { toValue: 0, duration: speed, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start()

    // Solo recording usa los 3 anillos — más intenso
    if (micState === 'recording') {
      Animated.loop(
        Animated.sequence([
          Animated.delay(speed * 0.33),
          Animated.timing(ring2, { toValue: 1, duration: speed, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(ring2, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start()
      Animated.loop(
        Animated.sequence([
          Animated.delay(speed * 0.66),
          Animated.timing(ring3, { toValue: 1, duration: speed, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(ring3, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start()
    }
  }, [micState])

  const color = MIC_STATES[micState].color

  const breathStyle = {
    opacity: breath.interpolate({ inputRange: [0, 1], outputRange: [0, 0.18] }),
    transform: [{ scale: breath.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] }) }]
  }
  const ringStyle = (anim: Animated.Value) => ({
    opacity: anim.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.15, 0] }),
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.8] }) }]
  })

  return (
    <View style={s.micWrapper}>
      <Animated.View style={[s.ring, { backgroundColor: color }, breathStyle]} />
      {micState === 'recording' && (
        <>
          <Animated.View style={[s.ring, { backgroundColor: color }, ringStyle(ring2)]} />
          <Animated.View style={[s.ring, { backgroundColor: color }, ringStyle(ring3)]} />
        </>
      )}
      <TouchableOpacity style={[s.micBtn, { backgroundColor: color }]} onPress={onPress} activeOpacity={0.85}>
        <Ionicons name={micState === 'recording' ? 'stop' : 'mic'} size={44} color={bgColor} />
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  micWrapper: { width: 140, height: 140, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 140, height: 140, borderRadius: 70 },
  micBtn: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
})
