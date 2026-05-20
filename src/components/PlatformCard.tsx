import React, { useRef, useEffect } from 'react'
import { View, Text, TouchableOpacity, Switch, TextInput, ScrollView, Animated, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { AnimatedDots } from './AnimatedDots'
import { EmojiPicker } from './EmojiPicker'
import { applyTextStyle, STYLE_OPTIONS, TextStyleType } from '../utils/textStyles'

const DARK_COLORS = ['#1a1a1a', '#333333', '#000000', '#1a1a2e', '#444444', '#555555']
const getVisibleColor = (color: string, fallback: string) => DARK_COLORS.includes(color) ? fallback : color

const PLATFORM_EMOJIS: Record<string, string[]> = {
  twitter:   ['🔥', '💡', '✨', '🎯', '😤', '👀', '🧵', '💬'],
  instagram: ['🌿', '🌅', '💫', '🙌', '❤️', '📸', '✨', '🌸'],
  reddit:    ['🤔', '💬', '👀', '🧠', '📌', '⬆️', '🎭', '💎'],
  linkedin:  ['💼', '🚀', '📈', '🤝', '✅', '💡', '🎯', '🌟'],
  threads:   ['✨', '💭', '🌀', '🔮', '💫', '🎨', '🌊', '🦋'],
  tiktok:    ['🎵', '🔥', '💃', '🎬', '✨', '😂', '❤️', '🚀'],
  facebook:  ['❤️', '😊', '🙌', '💪', '🎉', '👏', '🌟', '💬'],
  whatsapp:  ['👋', '😊', '🙏', '❤️', '✅', '🎉', '💪', '🌟'],
  pinterest: ['📌', '🌸', '✨', '💫', '🎨', '🌿', '💕', '🏡'],
}

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
  const visibleColor = getVisibleColor(platform.color, theme.accent)
  const recommendation = pdata.bestTime || pdata.recommendation

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={[s.card, { backgroundColor: platform.color + '15', borderColor: platform.color, borderWidth: 1.5 }]}>

        <TouchableOpacity style={s.cardHeader} onPress={onToggleExpand}>
          <View style={[s.dot, { backgroundColor: platform.color }]} />
          <Text style={[s.platformName, { color: theme.text }]}>{platform.name}</Text>
          {!isExpanded && (
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={[s.preview, { color: theme.textMuted }]} numberOfLines={1}>
                {pdata.content.slice(0, 42)}
              </Text>
              <AnimatedDots color={platform.color} fallbackColor={theme.text} />
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

            <View style={s.emojiRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                {(PLATFORM_EMOJIS[platform.key] || PLATFORM_EMOJIS['twitter']).map((emoji: string) => (
                  <TouchableOpacity key={emoji} style={s.emojiBtn} onPress={() => onEditChange((editText || pdata.content) + ' ' + emoji)}>
                    <Text style={s.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <EmojiPicker theme={theme} color={visibleColor} onSelect={(emoji) => onEditChange((editText || pdata.content) + ' ' + emoji)} />
            </View>

            {isEditing ? (
              <View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.styleBarScroll}>
                  {(STYLE_OPTIONS as any[]).map(style => (
                    <TouchableOpacity
                      key={style.key}
                      style={[s.styleBtn, textStyle === style.key && { borderColor: visibleColor, backgroundColor: visibleColor + '20' }]}
                      onPress={() => setTextStyle(style.key)}
                    >
                      <Text style={[s.styleBtnText, { color: textStyle === style.key ? visibleColor : theme.textMuted, fontWeight: style.fw, fontStyle: style.fi, letterSpacing: style.ls }, style.mono && { fontFamily: 'Courier' }]}>
                        {style.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TextInput
                  style={[s.editInput, { color: theme.text, borderColor: visibleColor + '60' }]}
                  value={editText}
                  onChangeText={onEditChange}
                  multiline autoFocus
                  onBlur={onEditBlur}
                />
                <TouchableOpacity style={[s.saveBtn, { backgroundColor: visibleColor + '20', borderColor: visibleColor }]} onPress={onToggleEdit}>
                  <Text style={[s.saveBtnText, { color: visibleColor }]}>✓ {t.save}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={onToggleEdit}
                style={[s.textTouchable, { borderColor: theme.border }]}
                activeOpacity={0.7}
              >
                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false} style={{ maxHeight: 180 }}>
                  <Text style={[s.content, { color: theme.text }]}>{applyTextStyle(pdata.content, textStyle)}</Text>
                  {hashtags.length > 0 && <Text style={[s.hashtags, { color: theme.accent + '88' }]}>{hashtags.join(' ')}</Text>}
                </ScrollView>
                <Text style={[s.tapToEdit, { color: theme.textDisabled }]}>
                  {t.lang === 'es' ? 'tocá para editar' : 'tap to edit'}
                </Text>
              </TouchableOpacity>
            )}

            {recommendation && (
              <View style={[s.recChip, { borderColor: visibleColor + '40', backgroundColor: visibleColor + '10' }]}>
                <Text style={[s.recText, { color: visibleColor }]}>📅 {recommendation}</Text>
              </View>
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
  platformName: { fontSize: 14, fontWeight: '600', width: 80 },
  preview: { flex: 1, fontSize: 12 },
  cardBody: { paddingHorizontal: 14, paddingBottom: 14 },
  divider: { height: 0.5, marginBottom: 10 },
  emojiBar: { marginBottom: 10 },
  emojiRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  emojiBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  emojiText: { fontSize: 20 },
  textTouchable: { borderRadius: 10, borderWidth: 0.5, padding: 12, marginBottom: 8 },
  content: { fontSize: 14, lineHeight: 22, fontWeight: '300' },
  hashtags: { marginTop: 8, fontSize: 12 },
  tapToEdit: { fontSize: 10, letterSpacing: 1, textAlign: 'right', marginTop: 6, opacity: 0.6 },
  styleBarScroll: { marginBottom: 10 },
  styleBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: 'transparent', marginRight: 6 },
  styleBtnText: { fontSize: 13 },
  editInput: { fontSize: 14, lineHeight: 22, minHeight: 100, textAlignVertical: 'top', borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 8 },
  saveBtn: { alignSelf: 'flex-end', paddingHorizontal: 16, paddingVertical: 7, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  saveBtnText: { fontSize: 13, fontWeight: '600' },
  recChip: { alignSelf: 'flex-start', borderRadius: 20, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, marginTop: 6 },
  recText: { fontSize: 11, letterSpacing: 0.3 },
})
