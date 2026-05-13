import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Clipboard, TextInput } from 'react-native'
import { useVoxaStore } from '../store/voxa.store'
import { useLanguage } from '../hooks/useLanguage'
import { useTheme } from '../theme'

const PLATFORMS = [
  { key: 'twitter', name: 'X', color: '#c8b99a' },
  { key: 'linkedin', name: 'LinkedIn', color: '#4a9eff' },
  { key: 'threads', name: 'Threads', color: '#c8b99a' },
  { key: 'instagram', name: 'Instagram', color: '#e1306c' },
]

export default function ReviewScreen({ navigation }: any) {
  const { result, reset, updatePlatformContent } = useVoxaStore()
  const { t } = useLanguage()
  const theme = useTheme()
  const [current, setCurrent] = useState(0)
  const [approved, setApproved] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState('')

  React.useEffect(() => { if (!result) navigation.navigate('Capture') }, [result])
  if (!result) return null

  const platform = PLATFORMS[current]
  const pdata = result.platforms[platform.key as keyof typeof result.platforms]
  const content = pdata.content
  const hashtags = 'hashtags' in pdata ? (pdata as any).hashtags : []
  const isApproved = approved.includes(platform.key)
  const isLast = current === PLATFORMS.length - 1

  const handleApprove = () => {
    if (!isApproved) setApproved([...approved, platform.key])
    if (!isLast) setCurrent(current + 1)
    else navigation.navigate('Confirm')
  }

  const handleSkip = () => {
    if (!isLast) setCurrent(current + 1)
    else navigation.navigate('Confirm')
  }

  const handleEdit = () => { setEditText(content); setEditing(true) }
  const handleSaveEdit = () => { updatePlatformContent(platform.key, editText); setEditing(false) }
  const handleCopy = () => { Clipboard.setString(content); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => { reset(); navigation.navigate('Capture') }}>
          <Text style={[s.backBtn, { color: theme.textMuted }]}>{t.back}</Text>
        </TouchableOpacity>
        <Text style={[s.ideaLabel, { color: theme.textSecondary }]} numberOfLines={1}>{result.analysis.topic}</Text>
        <Text style={[s.counter, { color: theme.textMuted }]}>{current + 1} / {PLATFORMS.length}</Text>
      </View>
      <View style={s.tabRow}>
        {PLATFORMS.map((p, i) => (
          <TouchableOpacity key={p.key} style={s.tab} onPress={() => setCurrent(i)}>
            <View style={[s.tabDot, { backgroundColor: p.color }, i !== current && s.tabDotInactive]} />
            <Text style={[s.tabLabel, { color: theme.textMuted }, i === current && { color: theme.accent }]}>{p.name}</Text>
            {approved.includes(p.key) && <Text style={[s.checkMark, { color: theme.accent }]}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>
      <View style={[s.card, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
        <View style={s.cardHeader}>
          <View style={s.platformBadge}>
            <View style={[s.dot, { backgroundColor: platform.color }]} />
            <Text style={[s.platformName, { color: theme.text }]}>{platform.name}</Text>
          </View>
          <TouchableOpacity style={[s.copyBtn, { borderColor: theme.border }]} onPress={handleCopy}>
            <Text style={[s.copyBtnText, { color: theme.textDisabled }, copied && { color: theme.success }]}>{copied ? t.copied : t.copy}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={s.contentScroll} showsVerticalScrollIndicator={false}>
          {editing ? (
            <TextInput
              style={[s.contentEdit, { color: theme.textSecondary }]}
              value={editText}
              onChangeText={setEditText}
              multiline
              autoFocus
            />
          ) : (
            <>
              <Text style={[s.content, { color: theme.text }]}>{content}</Text>
              {hashtags.length > 0 && <Text style={[s.hashtags, { color: theme.accent + '33' }]}>{hashtags.join(' ')}</Text>}
            </>
          )}
        </ScrollView>
        <View style={s.cardActions}>
          <TouchableOpacity style={[s.skipBtn, { borderColor: theme.border }]} onPress={handleSkip}>
            <Text style={[s.skipBtnText, { color: theme.textSecondary }]}>{t.skip}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.editBtn, { borderColor: theme.border }]} onPress={editing ? handleSaveEdit : handleEdit}>
            <Text style={[s.editBtnText, { color: theme.textSecondary }]}>{editing ? t.save : t.edit}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.approveBtn, { backgroundColor: theme.accent }, isApproved && { backgroundColor: theme.success + '22', borderWidth: 0.5, borderColor: theme.success + '44' }]}
            onPress={handleApprove}
          >
            <Text style={[s.approveBtnText, { color: theme.bg }]}>{isApproved ? t.approved : isLast ? t.approveAndConfirm : t.approve}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={s.bottomBar}>
        <Text style={[s.approvedCount, { color: theme.accent }]}>{approved.length} {t.approved}</Text>
        <View style={s.dots}>
          {PLATFORMS.map(p => (
            <View key={p.key} style={[s.dot2, { backgroundColor: theme.bgTertiary }, approved.includes(p.key) && { backgroundColor: theme.accent }]} />
          ))}
        </View>
        <TouchableOpacity
          style={[s.approveAllBtn, { backgroundColor: theme.accentLight, borderColor: theme.accent + '44' }]}
          onPress={() => { setApproved(PLATFORMS.map(p => p.key)); navigation.navigate('Confirm') }}
        >
          <Text style={[s.approveAllText, { color: theme.accent }]}>{t.approveAll}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 12 },
  backBtn: { fontSize: 14, marginRight: 12 },
  ideaLabel: { flex: 1, fontSize: 13, fontStyle: 'italic' },
  counter: { fontSize: 11 },
  tabRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16, gap: 4 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8, gap: 4 },
  tabDot: { width: 6, height: 6, borderRadius: 3 },
  tabDotInactive: { opacity: 0.25 },
  tabLabel: { fontSize: 9 },
  checkMark: { fontSize: 8 },
  card: { flex: 1, marginHorizontal: 20, borderRadius: 20, borderWidth: 0.5, padding: 20, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  platformBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  platformName: { fontSize: 13, fontWeight: '500' },
  copyBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, borderWidth: 0.5 },
  copyBtnText: { fontSize: 11 },
  contentScroll: { flex: 1 },
  content: { fontSize: 14, lineHeight: 22, fontWeight: '300' },
  hashtags: { marginTop: 12, fontSize: 12, lineHeight: 20 },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 16 },
  skipBtn: { flex: 1, height: 40, borderRadius: 12, borderWidth: 0.5, alignItems: 'center', justifyContent: 'center' },
  skipBtnText: { fontSize: 12 },
  editBtn: { flex: 1, height: 40, borderRadius: 12, borderWidth: 0.5, alignItems: 'center', justifyContent: 'center' },
  editBtnText: { fontSize: 12 },
  approveBtn: { flex: 1.4, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  approveBtnText: { fontSize: 12, fontWeight: '500' },
  bottomBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 24 },
  approvedCount: { fontSize: 11, flex: 1, fontWeight: '500' },
  dots: { flexDirection: 'row', gap: 5 },
  dot2: { width: 5, height: 5, borderRadius: 3 },
  contentEdit: { fontSize: 14, lineHeight: 22, minHeight: 120, textAlignVertical: 'top' },
  approveAllBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 0.5 },
  approveAllText: { fontSize: 11 },
})
