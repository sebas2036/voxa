import React from 'react'
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, Image } from 'react-native'

export type FilterKey = 'original' | 'noir' | 'golden' | 'fade' | 'vivid' | 'matte' | 'sepia' | 'cold' | 'bw'

export interface Filter {
  key: FilterKey
  label: string
  color: string
  textColor: string
  overlay?: string
  overlayOpacity?: number
}

export const FILTERS: Filter[] = [
  { key: 'original', label: 'original', color: 'rgba(255,255,255,0.15)', textColor: '#fff' },
  { key: 'noir',     label: 'noir',     color: 'rgba(20,20,20,0.85)',    textColor: '#aaa', overlay: '#000000', overlayOpacity: 0.45 },
  { key: 'golden',   label: 'golden',   color: 'rgba(212,171,84,0.3)',   textColor: '#d4ab54', overlay: '#c8860a', overlayOpacity: 0.28 },
  { key: 'fade',     label: 'fade',     color: 'rgba(200,200,200,0.2)',  textColor: '#ccc', overlay: '#ffffff', overlayOpacity: 0.30 },
  { key: 'vivid',    label: 'vivid',    color: 'rgba(220,60,60,0.25)',   textColor: '#ff6b6b', overlay: '#ff2200', overlayOpacity: 0.15 },
  { key: 'matte',    label: 'matte',    color: 'rgba(139,120,100,0.3)',  textColor: '#c8b99a', overlay: '#8b7264', overlayOpacity: 0.25 },
  { key: 'sepia',    label: 'sépia',    color: 'rgba(160,120,60,0.3)',   textColor: '#c8a060', overlay: '#a07840', overlayOpacity: 0.35 },
  { key: 'cold',     label: 'polar',    color: 'rgba(80,140,220,0.25)',  textColor: '#80b4ff', overlay: '#1040c0', overlayOpacity: 0.20 },
  { key: 'bw',       label: 'b&w',      color: 'rgba(255,255,255,0.08)',  textColor: '#ffffff', overlay: '#1a1a1a', overlayOpacity: 0.55 },
]

export function PhotoFilterStrip({ activeFilter, onSelect }: { activeFilter: FilterKey, onSelect: (f: FilterKey) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.strip} style={s.container}>
      {FILTERS.map(f => {
        const isActive = f.key === activeFilter
        return (
          <TouchableOpacity
            key={f.key}
            onPress={() => onSelect(f.key)}
            style={[s.chip, { backgroundColor: f.color }, isActive && { borderColor: f.textColor, borderWidth: 1.5 }]}
            activeOpacity={0.75}
          >
            <Text style={[s.chipText, { color: f.textColor }, isActive && { fontWeight: '600' }]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}

export function FilteredImage({ uri, filter, style }: { uri: string, filter: FilterKey, style?: any }) {
  const f = FILTERS.find(x => x.key === filter) || FILTERS[0]
  return (
    <View style={[style, { overflow: 'hidden' }]}>
      <Image source={{ uri }} style={[StyleSheet.absoluteFill, { borderRadius: style?.borderRadius || 12 }]} resizeMode="cover" />
      {f.overlay && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: f.overlay, opacity: f.overlayOpacity || 0, borderRadius: style?.borderRadius || 12 }]} />
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  strip: { paddingHorizontal: 12, gap: 6, paddingVertical: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  chipText: { fontSize: 11, letterSpacing: 1, textTransform: 'lowercase', fontWeight: '400' },
})
