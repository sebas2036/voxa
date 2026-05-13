import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Switch, TextInput, ActivityIndicator, Modal } from 'react-native'
import { useVoxStore } from '../store/vox.store'
import { useLanguage } from '../hooks/useLanguage'
import { useTheme } from '../theme'
import { PLATFORMS as PLATFORM_CONFIGS, publishToAll } from '../utils/deeplinks'
import AsyncStorage from '@react-native-async-storage/async-storage'

const ALL_EXTRA = [
  { key: 'whatsapp', name: 'WhatsApp', color: '#25D366' },
  { key: 'telegram', name: 'Telegram', color: '#2AABEE' },
  { key: 'tiktok', name: 'TikTok', color: '#333333' },
  { key: 'facebook', name: 'Facebook', color: '#1877F2' },
  { key: 'pinterest', name: 'Pinterest', color: '#E60023' },
  { key: 'email', name: 'Email', color: '#888888' },
]

const PLATFORMS = PLATFORM_CONFIGS

export default function ReviewScreen({ navigation }: any) {
  const { result, reset, updatePlatformContent } = useVoxStore()
  const { t } = useLanguage()
  const theme = useTheme()
  const [enabled, setEnabled] = useState<Record<string, boolean>>({ twitter: true, linkedin: true, threads: true, instagram: true })
  const [expanded, setExpanded] = useState<string | null>('twitter')
  const [editing, setEditing] = useState<string | null>(null)
  const [editTexts, setEditTexts] = useState<Record<string, string>>({})
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [extraPlatforms, setExtraPlatforms] = useState<any[]>([])
  const [extraContents, setExtraContents] = useState<Record<string, string>>({})
  const [loadingExtra, setLoadingExtra] = useState<string | null>(null)

  React.useEffect(() => { if (!result) navigation.navigate('Capture') }, [result])
  if (!result) return null

  const activeCount = Object.values(enabled).filter(Boolean).length +
    extraPlatforms.filter(p => enabled[p.key] !== false).length

  const generateExtraContent = async (platform: any) => {
    setLoadingExtra(platform.key)
    try {
      const baseContent = result.platforms['twitter']?.content || result.platforms['linkedin']?.content || ''
      const response = await fetch('http://192.168.0.23:3000/generate-extra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: platform.name, topic: result.analysis.topic, baseContent, lang: t.lang })
      })
      const data = await response.json()
      setExtraContents(prev => ({ ...prev, [platform.key]: data.content || baseContent }))
    } catch (e) {
      const base = result.platforms['twitter']?.content || result.platforms['linkedin']?.content || ''
      setExtraContents(prev => ({ ...prev, [platform.key]: base }))
    }
    setLoadingExtra(null)
  }

  const handlePublish = async () => {
    setPublishing(true)
    const activePredefined = PLATFORMS.filter(p => enabled[p.key])
    const activeExtra = extraPlatforms.filter(p => enabled[p.key] !== false)
    const contents: Record<string, string> = {}
    activePredefined.forEach(platform => {
      const pdata = result.platforms[platform.key as keyof typeof result.platforms]
      const hashtags = 'hashtags' in pdata ? (pdata as any).hashtags?.join(' ') : ''
      contents[platform.key] = hashtags ? `${pdata.content}\n\n${hashtags}` : pdata.content
    })
    activeExtra.forEach(platform => {
      contents[platform.key] = extraContents[platform.key] || ''
    })
    const usedKeys = [...activePredefined.map(p => p.key), ...activeExtra.map(p => p.key)]
    await AsyncStorage.setItem('vox_last_platforms', JSON.stringify(usedKeys))
    try {
      await Promise.race([
        publishToAll([...activePredefined, ...activeExtra], contents),
        new Promise(resolve => setTimeout(resolve, 5000))
      ])
    } catch (e) {}
    setPublishing(false)
    setPublished(true)
    setTimeout(() => { reset(); navigation.navigate('Capture') }, 2000)
  }

  const activePlatformsList = [
    ...PLATFORMS.filter(p => enabled[p.key]),
    ...extraPlatforms.filter(p => enabled[p.key] !== false)
  ]

  if (published) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
        <View style={s.successScreen}>
          <View style={[s.checkCircle, { borderColor: theme.accent, backgroundColor: theme.accentLight }]}>
            <Text style={[s.checkText, { color: theme.accent }]}>✓</Text>
          </View>
          <Text style={[s.successTitle, { color: theme.text }]}>{t.published}</Text>
          <Text style={[s.successSub, { color: theme.textMuted }]}>{t.lang === 'es' ? 'enviado a' : 'sent to'}</Text>
          <View style={s.successPlatforms}>
            {activePlatformsList.map(p => (
              <View key={p.key} style={[s.successBadge, { borderColor: p.color + '88', backgroundColor: p.color + '15' }]}>
                <View style={[s.successDot, { backgroundColor: p.color }]} />
                <Text style={[s.successPlatformName, { color: p.color }]}>{p.name}</Text>
              </View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => { reset(); navigation.navigate('Capture') }}>
          <Text style={[s.backBtn, { color: theme.textMuted }]}>{t.back}</Text>
        </TouchableOpacity>
        <Text style={[s.title, { color: theme.text }]} numberOfLines={1}>{result.analysis.topic}</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll}>

        {PLATFORMS.filter(p => enabled[p.key]).map(platform => {
          const pdata = result.platforms[platform.key as keyof typeof result.platforms]
          const isExp = expanded === platform.key
          const isEdit = editing === platform.key
          const hashtags = 'hashtags' in pdata ? (pdata as any).hashtags || [] : []
          return (
            <View key={platform.key} style={[s.card, { backgroundColor: platform.color + '15', borderColor: platform.color, borderWidth: 1.5 }]}>
              <TouchableOpacity style={s.cardHeader} onPress={() => setExpanded(isExp ? null : platform.key)}>
                <View style={[s.dot, { backgroundColor: platform.color }]} />
                <Text style={[s.platformName, { color: theme.text, fontWeight: '600' }]}>{platform.name}</Text>
                {!isExp && <Text style={[s.preview, { color: theme.textMuted }]} numberOfLines={1}>{pdata.content.slice(0, 35)}...</Text>}
                <Switch
                  value={true}
                  onValueChange={() => {
                    const total = activeCount
                    if (total <= 1) return
                    setEnabled(prev => ({ ...prev, [platform.key]: false }))
                  }}
                  trackColor={{ false: theme.bgTertiary, true: platform.color + '44' }}
                  thumbColor={platform.color}
                  style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
                />
              </TouchableOpacity>
              {isExp && (
                <View style={s.cardBody}>
                  <View style={[s.divider, { backgroundColor: theme.border }]} />
                  <>
                      <TouchableOpacity style={[s.editTopBtn, { borderColor: theme.border }]}
                        onPress={() => { setEditTexts(prev => ({ ...prev, [platform.key]: pdata.content })); setEditing(isEdit ? null : platform.key) }}>
                        <Text style={[s.editTopBtnText, { color: isEdit ? theme.accent : theme.textSecondary }]}>{isEdit ? t.save : t.edit}</Text>
                      </TouchableOpacity>
                      {isEdit ? (
                        <TextInput
                          style={[s.editInput, { color: theme.text, borderColor: theme.border }]}
                          value={editTexts[platform.key]}
                          onChangeText={text => { setEditTexts(prev => ({ ...prev, [platform.key]: text })); updatePlatformContent(platform.key, text) }}
                          multiline autoFocus
                          onBlur={() => setEditing(null)}
                        />
                      ) : (
                        <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                          <Text style={[s.content, { color: theme.text }]}>{pdata.content}</Text>
                          {hashtags.length > 0 && <Text style={[s.hashtags, { color: theme.accent + '66' }]}>{hashtags.join(' ')}</Text>}
                        </ScrollView>
                      )}
                    </>
                </View>
              )}
            </View>
          )
        })}

        {extraPlatforms.filter(p => enabled[p.key] !== false).map(platform => {
          const cnt = extraContents[platform.key] || ''
          const isLoading = loadingExtra === platform.key
          const isExp = expanded === platform.key
          const isEdit = editing === platform.key
          return (
            <View key={platform.key} style={[s.card, { backgroundColor: isLoading ? '#2e7d5222' : platform.color + '15', borderColor: isLoading ? '#2e7d52' : platform.color, borderWidth: 1.5 }]}>
              <TouchableOpacity style={s.cardHeader} onPress={() => setExpanded(isExp ? null : platform.key)}>
                <View style={[s.dot, { backgroundColor: isLoading ? '#2e7d52' : platform.color }]} />
                <Text style={[s.platformName, { color: theme.text, fontWeight: '600' }]}>{platform.name}</Text>
                {isLoading
                  ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                      <ActivityIndicator size="small" color="#2e7d52" />
                      <Text style={{ color: '#2e7d52', fontSize: 12 }}>{t.lang === 'es' ? 'generando...' : 'generating...'}</Text>
                    </View>
                  : !isExp && <Text style={[s.preview, { color: theme.textMuted }]} numberOfLines={1}>{cnt.slice(0, 35)}...</Text>
                }
                <Switch
                  value={enabled[platform.key] !== false}
                  onValueChange={() => {
                    if (activeCount <= 1) return
                    setEnabled(prev => ({ ...prev, [platform.key]: !prev[platform.key] }))
                  }}
                  trackColor={{ false: theme.bgTertiary, true: platform.color + '44' }}
                  thumbColor={platform.color}
                  style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
                />
              </TouchableOpacity>
              {isExp && cnt.length > 0 && !isLoading && (
                <View style={s.cardBody}>
                  <View style={[s.divider, { backgroundColor: theme.border }]} />
                  <>
                      <TouchableOpacity style={[s.editTopBtn, { borderColor: theme.border }]}
                        onPress={() => { setEditTexts(prev => ({ ...prev, [platform.key]: cnt })); setEditing(isEdit ? null : platform.key) }}>
                        <Text style={[s.editTopBtnText, { color: isEdit ? theme.accent : theme.textSecondary }]}>{isEdit ? t.save : t.edit}</Text>
                      </TouchableOpacity>
                      {isEdit ? (
                        <TextInput
                          style={[s.editInput, { color: theme.text, borderColor: theme.border }]}
                          value={editTexts[platform.key]}
                          onChangeText={text => { setEditTexts(prev => ({ ...prev, [platform.key]: text })); setExtraContents(prev => ({ ...prev, [platform.key]: text })) }}
                          multiline autoFocus
                          onBlur={() => setEditing(null)}
                        />
                      ) : (
                        <Text style={[s.content, { color: theme.text }]}>{cnt}</Text>
                      )}
                    </>
                </View>
              )}
            </View>
          )
        })}

        <View style={[s.recBox, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
          <Text style={[s.recText, { color: theme.accent }]}>{result.recommendation.bestPlatform} — {result.recommendation.bestDay} {result.recommendation.bestTime}</Text>
        </View>

        <TouchableOpacity style={[s.addPlatformBtn, { borderColor: theme.border, backgroundColor: theme.bgSecondary }]} onPress={() => setShowAddModal(true)}>
          <Text style={[s.addPlatformText, { color: theme.textMuted }]}>+ {t.lang === 'es' ? 'agregar plataforma' : 'add platform'}</Text>
        </TouchableOpacity>

      </ScrollView>

      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setShowAddModal(false)}>
          <TouchableOpacity activeOpacity={1} style={[s.modal, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
            <View style={s.modalHeader}>
              <Text style={[s.modalTitle, { color: theme.text }]}>{t.lang === 'es' ? 'elegir plataforma' : 'choose platform'}</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)} style={s.modalCloseBtn}>
                <Text style={[s.modalClose, { color: theme.textMuted }]}>✕</Text>
              </TouchableOpacity>
            </View>
            {[
              ...PLATFORMS.filter(p => !enabled[p.key]),
              ...ALL_EXTRA.filter(p => !extraPlatforms.some(ep => ep.key === p.key))
            ].map(p => (
              <TouchableOpacity
                key={p.key}
                style={[s.modalRow, { borderBottomColor: theme.border }]}
                onPress={() => {
                  const isPredefined = PLATFORMS.some(pl => pl.key === p.key)
                  if (isPredefined) {
                    setEnabled(prev => ({ ...prev, [p.key]: true }))
                  } else {
                    setExtraPlatforms(prev => [...prev, p])
                    generateExtraContent(p)
                  }
                  setShowAddModal(false)
                }}
              >
                <View style={[s.modalDot, { backgroundColor: p.color }]} />
                <Text style={[s.modalPlatformName, { color: theme.text }]}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <View style={[s.footer, { backgroundColor: theme.bg, borderTopColor: theme.bgSecondary }]}>
        <Text style={[s.activeCount, { color: theme.textMuted }]}>{activeCount} {t.lang === 'es' ? 'activas' : 'active'}</Text>
        <TouchableOpacity
          style={[s.publishBtn, { backgroundColor: theme.accent }, (activeCount === 0 || publishing) && { opacity: 0.4 }]}
          onPress={handlePublish}
          disabled={activeCount === 0 || publishing}
        >
          <Text style={[s.publishBtnText, { color: '#0a0a0a' }]}>{publishing ? (t.lang === 'es' ? 'compartiendo...' : 'sharing...') : t.publishNow}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 12 },
  backBtn: { fontSize: 14 },
  title: { flex: 1, fontSize: 13, fontStyle: 'italic', marginHorizontal: 12 },
  scroll: { padding: 16, paddingBottom: 100 },
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
  actionBtn: { alignSelf: 'flex-end', marginTop: 10, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, borderWidth: 0.5 },
  editTopBtn: { alignSelf: 'flex-start', marginBottom: 12, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, borderWidth: 0.5 },
  editTopBtnText: { fontSize: 12, fontWeight: '600' },
  actionBtnText: { fontSize: 12 },
  recBox: { borderRadius: 12, borderWidth: 0.5, padding: 14, marginBottom: 10 },
  recText: { fontSize: 12, lineHeight: 18 },
  addPlatformBtn: { borderRadius: 16, borderWidth: 0.5, borderStyle: 'dashed', padding: 16, marginTop: 4, alignItems: 'center' },
  addPlatformText: { fontSize: 13, letterSpacing: 0.5 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 36, flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 0.5 },
  activeCount: { fontSize: 12 },
  publishBtn: { flex: 1, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  publishBtnText: { fontSize: 16, fontWeight: '500' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modal: { borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 0.5, padding: 20, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 16, fontWeight: '500' },
  modalCloseBtn: { padding: 8 },
  modalClose: { fontSize: 16 },
  modalRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5, gap: 12 },
  modalDot: { width: 10, height: 10, borderRadius: 5 },
  modalPlatformName: { flex: 1, fontSize: 14 },
  successScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  checkCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  checkText: { fontSize: 32, fontWeight: '300' },
  successTitle: { fontSize: 28 },
  successSub: { fontSize: 13, marginBottom: 20 },
  successPlatforms: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', paddingHorizontal: 24 },
  successBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  successDot: { width: 6, height: 6, borderRadius: 3 },
  successPlatformName: { fontSize: 12, fontWeight: '500' },
})
