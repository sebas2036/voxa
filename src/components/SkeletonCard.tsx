import React, { useRef, useEffect } from 'react'
import { View, Text, Animated, ActivityIndicator, StyleSheet } from 'react-native'

export function SkeletonCard({ platform, theme }: { platform: any; theme: any }) {
  const anim = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start()
    return () => anim.stopAnimation()
  }, [])

  return (
    <View style={[s.card, { backgroundColor: platform.color + '0A', borderColor: platform.color + '40', borderWidth: 1.5 }]}>
      <View style={s.cardHeader}>
        <View style={[s.dot, { backgroundColor: platform.color + '60' }]} />
        <Text style={[s.platformName, { color: theme.text, fontWeight: '600', opacity: 0.5 }]}>{platform.name}</Text>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <ActivityIndicator size="small" color={platform.color} />
          <Text style={{ color: platform.color, fontSize: 11, opacity: 0.8 }}>generando...</Text>
        </View>
      </View>
      <View style={{ paddingHorizontal: 14, paddingBottom: 16, gap: 8 }}>
        <Animated.View style={[s.skeletonLine, { backgroundColor: platform.color + '20', opacity: anim }]} />
        <Animated.View style={[s.skeletonLine, { width: '75%', backgroundColor: platform.color + '20', opacity: anim }]} />
        <Animated.View style={[s.skeletonLine, { width: '55%', backgroundColor: platform.color + '20', opacity: anim }]} />
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  card: { borderRadius: 16, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  platformName: { fontSize: 14, width: 80 },
  skeletonLine: { height: 11, borderRadius: 6, width: '100%' },
})
