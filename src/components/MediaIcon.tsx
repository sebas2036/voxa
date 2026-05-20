import React, { useRef } from 'react'
import { TouchableOpacity, Animated, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  icon: any
  label: string
  onPress: () => void
  theme: any
}

export function MediaIcon({ icon, label, onPress, theme }: Props) {
  const scale = useRef(new Animated.Value(1)).current
  const glow  = useRef(new Animated.Value(0)).current

  const handlePress = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 0.88, useNativeDriver: true, speed: 50 }),
        Animated.timing(glow,  { toValue: 1, duration: 120, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }),
        Animated.timing(glow,  { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
    ]).start()
    onPress()
  }

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={1} style={s.wrap}>
      <Animated.View style={{ transform: [{ scale }], opacity: glow.interpolate({ inputRange: [0,1], outputRange: [0.75,1] }) }}>
        <Ionicons name={icon} size={26} color={theme.accent} />
      </Animated.View>
      <Animated.Text style={[s.label, { color: theme.textMuted, opacity: glow.interpolate({ inputRange: [0,1], outputRange: [0.7,0.95] }) }]}>
        {label}
      </Animated.Text>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  wrap:  { alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 8 },
  label: { fontSize: 10, letterSpacing: 2, textTransform: 'lowercase', fontWeight: '300' },
})
