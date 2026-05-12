import React, { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Clipboard, TextInput } from 'react-native'
import { useVoxaStore } from '../store/voxa.store'

const PLATFORMS = [
  { key: 'twitter', name: 'X', color: '#c8b99a' },
  { key: 'linkedin', name: 'LinkedIn', color: '#4a9eff' },
  { key: 'threads', name: 'Threads', color: '#aaa' },
  { key: 'instagram', name: 'Instagram', color: '#e1306c' },
]

export default function ReviewScreen({ navigation }: any) {
  const { result, reset, updatePlatformContent } = useVoxaStore()
  const [current, setCurrent] = useState(0)
  const [approved, setApproved] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState('')

  useEffect(() => {
    if (!result) navigation.navigate('Capture')
  }, [result])
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

  const handleEdit = () => {
    setEditText(content)
    setEditing(true)
  }

  const handleSaveEdit = () => {
    updatePlatformContent(platform.key, editText)
    setEditing(false)
  }

  const handleCopy = () => {
    Clipboard.setString(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => { reset(); navigation.navigate('Capture') }}>
          <Text style={s.backBtn}>atras</Text>
        </TouchableOpacity>
        <Text style={s.ideaLabel} numberOfLines={1}>{result.analysis.topic}</Text>
        <Text style={s.counter}>{current + 1} / {PLATFORMS.length}</Text>
      </View>
      <View style={s.tabRow}>
        {PLATFORMS.map((p, i) => (
          <TouchableOpacity key={p.key} style={s.tab} onPress={() => setCurrent(i)}>
            <View style={[s.tabDot, { backgroundColor: p.color }, i !== current && s.tabDotInactive]} />
            <Text style={[s.tabLabel, i === current && s.tabLabelActive]}>{p.name.split(' ')[0]}</Text>
            {approved.includes(p.key) && <Text style={s.checkMark}>v</Text>}
          </TouchableOpacity>
        ))}
      </View>
      <View style={s.card}>
        <View style={s.cardHeader}>
          <View style={s.platformBadge}>
            <View style={[s.dot, { backgroundColor: platform.color }]} />
            <Text style={s.platformName}>{platform.name}</Text>
          </View>
          <TouchableOpacity style={s.copyBtn} onPress={handleCopy}>
            <Text style={[s.copyBtnText, copied && s.copyBtnCopied]}>{copied ? 'copiado' : 'copiar'}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={s.contentScroll} showsVerticalScrollIndicator={false}>
          {editing ? (
            <TextInput
              style={s.contentEdit}
              value={editText}
              onChangeText={setEditText}
              multiline
              autoFocus
            />
          ) : (
            <>
              <Text style={s.content}>{content}</Text>
              {hashtags.length > 0 && <Text style={s.hashtags}>{hashtags.join(' ')}</Text>}
            </>
          )}
        </ScrollView>
        <View style={s.cardActions}>
          <TouchableOpacity style={s.skipBtn} onPress={handleSkip}>
            <Text style={s.skipBtnText}>saltar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.editBtn} onPress={editing ? handleSaveEdit : handleEdit}>
            <Text style={s.editBtnText}>{editing ? 'guardar' : 'editar'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.approveBtn, isApproved && s.approveBtnDone]} onPress={handleApprove}>
            <Text style={s.approveBtnText}>{isApproved ? 'aprobado' : isLast ? 'aprobar y confirmar' : 'aprobar'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={s.bottomBar}>
        <Text style={s.approvedCount}>{approved.length} aprobados</Text>
        <View style={s.dots}>
          {PLATFORMS.map(p => (
            <View key={p.key} style={[s.dot2, approved.includes(p.key) && s.dot2Active]} />
          ))}
        </View>
        <TouchableOpacity
          style={s.approveAllBtn}
          onPress={() => {
            setApproved(PLATFORMS.map(p => p.key))
            navigation.navigate('Confirm')
          }}
        >
          <Text style={s.approveAllText}>aprobar todas</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0a0a0a' },
  topBar: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 12 },
  backBtn: { fontSize: 14, color: '#444', marginRight: 12 },
  ideaLabel: { flex: 1, fontSize: 13, color: '#888', fontStyle: 'italic' },
  counter: { fontSize: 11, color: '#888' },
  tabRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16, gap: 4 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8, gap: 4 },
  tabDot: { width: 6, height: 6, borderRadius: 3 },
  tabDotInactive: { opacity: 0.25 },
  tabLabel: { fontSize: 9, color: '#888' },
  tabLabelActive: { color: '#c8b99a' },
  checkMark: { fontSize: 8, color: '#c8b99a' },
  card: { flex: 1, marginHorizontal: 20, backgroundColor: '#111', borderRadius: 20, borderWidth: 0.5, borderColor: '#1e1e1e', padding: 20, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  platformBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  platformName: { fontSize: 13, color: '#fff', letterSpacing: 0, textTransform: 'none', fontWeight: '500' },
  copyBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, borderWidth: 0.5, borderColor: '#1e1e1e' },
  copyBtnText: { fontSize: 11, color: '#333' },
  copyBtnCopied: { color: '#4caf7d' },
  contentScroll: { flex: 1 },
  content: { fontSize: 14, color: '#e0ddd8', lineHeight: 22, fontWeight: '300' },
  hashtags: { marginTop: 12, fontSize: 12, color: '#c8b99a33', lineHeight: 20 },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 16 },
  skipBtn: { flex: 1, height: 40, borderRadius: 12, borderWidth: 0.5, borderColor: '#1e1e1e', alignItems: 'center', justifyContent: 'center' },
  skipBtnText: { fontSize: 12, color: '#aaa' },
  editBtn: { flex: 1, height: 40, borderRadius: 12, borderWidth: 0.5, borderColor: '#1e1e1e', alignItems: 'center', justifyContent: 'center' },
  editBtnText: { fontSize: 12, color: '#aaa' },
  approveBtn: { flex: 1.4, height: 40, borderRadius: 12, backgroundColor: '#c8b99a', alignItems: 'center', justifyContent: 'center' },
  approveBtnDone: { backgroundColor: '#4caf7d22', borderWidth: 0.5, borderColor: '#4caf7d44' },
  approveBtnText: { fontSize: 12, color: '#0a0a0a', fontWeight: '500' },
  bottomBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 24 },
  approvedCount: { fontSize: 11, color: '#c8b99a', flex: 1, fontWeight: '500' },
  dots: { flexDirection: 'row', gap: 5 },
  dot2: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#1a1a1a' },
  dot2Active: { backgroundColor: '#c8b99a' },
  summaryLink: { fontSize: 11, color: '#333', marginLeft: 12 },
  contentEdit: { fontSize: 14, color: '#aaa', lineHeight: 22, minHeight: 120, textAlignVertical: 'top' },
  approveAllBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#c8b99a18', borderWidth: 0.5, borderColor: '#c8b99a44' },
  approveAllText: { fontSize: 11, color: '#c8b99a' },
})