import React, { useRef, useEffect } from 'react'
import { View, Text, TouchableOpacity, Switch, TextInput, ScrollView, Animated, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { AnimatedDots } from './AnimatedDots'
import { applyTextStyle, STYLE_OPTIONS, TextStyleType } from '../utils/textStyles'

export function PlatformCard({ platform, pdata, isExpanded, isEditing, editText, enabled, activeCount, onToggleExpand, onToggleEdit, onEditChange, onEditBlur, onToggleEnabled, theme, t }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(12)).current
  const [textStyle, setTextStyle] = React.useState<TextStyleType>('normal')

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start()
  }, [])

  const hashtags = 'hashtags' in pdata ? (pdata as any).hashtags || [] : []

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={[s.card, { backgroundColor: platform.color + '15', borderColor: platform.color, borderWidth: 1.5 }]}>
        <TouchableOpacity style={s.cardHeader} onPress={onToggleExpand}>
          <View style={[s.dot, { backgroundColor: platform.color }]} />
          <Text style={[s.platformName, { color: theme.text, fontWeight: '600' }]}>{platform.name}</Text>
          {!isExpanded && (
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={[s.preview, { color: theme.textMuted }]} numberOfLines={1}>
                {pdata.content.slice(0, 42)}
              </Text>
              <AnimatedDots color={platform.color} />
            </View>
          )}
          <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={theme.textSecondary} style={{ marginRight: 2 }} />
          <Switch
            value={enabled}
            onValueChange={() => { if (activeCount <= 1) return; onToggleEnabled() }}
            trackColor={{ false: theme.bgTertiary, true: platform.color + '44' }}
            thumbColor={platform.color}
            style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
          />
        </TouchableOpacity>
        {isExpanded && (
          <View style={s.cardBody}>
            <View style={[s.divider, { backgroundColor: theme.border }]} />
            <TouchableOpacity style={[s.editTopBtn, { borderColor: theme.border }]} onPress={onToggleEdit}>
              <Text style={[s.editTopBtnText, { color: isEditing ? theme.accent : theme.textSecondary }]}>{isEditing ? t.save : t.edit}</Text>
            </TouchableOpacity>
            <View style={s.styleBar}>
              {(STYLE_OPTIONS as any[]).map(style => (
                <TouchableOpacity
                  key={style.key}
                  style={[s.styleBtn, textStyle === style.key && { borderColor: platform.color, backgroundColor: platform.color + '15' }]}
                  onPress={() => setTextStyle(style.key)}
                >
                  <Text style={[s.styleBtnText, { color: textStyle === style.key ? platform.color : theme.textMuted, fontWeight: style.fw, fontStyle: style.fi, letterSpacing: style.ls }, style.mono && { fontFamily: 'Courier' }]}>
                    {style.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {isEditing ? (
              <TextInput
                style={[s.editInput, { color: theme.text, borderColor: theme.border }]}
                value={editText}
                onChangeText={onEditChange}
                multiline autoFocus
                onBlur={onEditBlur}
              />
            ) : (
              <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                <Text style={[s.content, { color: theme.text }]}>{applyTextStyle(pdata.content, textStyle)}</Text>
                {hashtags.length > 0 && <Text style={[s.hashtags, { color: theme.accent + '66' }]}>{hashtags.join(' ')}</Text>}
              </ScrollView>
            )}
          </View>
        )}
      </View>
    </Animated.View>
  )
}

const s = StyleSheet.create({
  card: { borderRadius: 16, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  platformName: { fontSize: 14, width: 80 },
  preview: { flex: 1, fontSize: 12 },
  cardBody: { paddingHorizontal: 14, paddingBottom: 14 },
  divider: { height: 0.5, marginBottom: 12 },
  content: { fontSize: 14, lineHeight: 22, fontWeight: '300' },
  hashtags: { marginTop: 8, fontSize: 12 },
  editInput: { fontSize: 14, lineHeight: 22, minHeight: 100, textAlignVertical: 'top', borderWidth: 0.5, borderRadius: 10, padding: 10, marginBottom: 8 },
  editTopBtn: { alignSelf: 'flex-start', marginBottom: 12, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, borderWidth: 0.5 },
  editTopBtnText: { fontSize: 12, fontWeight: '600' },
  styleBar: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  styleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'transparent' },
  styleBtnText: { fontSize: 13 },
})
