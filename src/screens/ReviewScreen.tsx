import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Switch, Share, TextInput } from 'react-native'
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
  const [enabled, setEnabled] = useState({ twitter: true, linkedin: true, threads: true, instagram: true })
  const [expanded, setExpanded] = useState<string | null>('twitter')
  const [editing, setEditing] = useState<string | null>(null)
  const [editTexts, setEditTexts] = useState<Record<string, string>>({})
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)

  React.useEffect(() => { if (!result) navigation.navigate('Capture') }, [result])
  if (!result) return null

  const activeCount = Object.values(enabled).filter(Boolean).length

  const handlePublish = async () => {
    setPublishing(true)
    const activePlatforms = PLATFORMS.filter(p => enabled[p.key as keyof typeof enabled])
    for (const platform of activePlatforms) {
      const pdata = result.platforms[platform.key as keyof typeof result.platforms]
      const hashtags = 'hashtags' in pdata ? (pdata as any).hashtags?.join(' ') : ''
      const fullContent = hashtags ? `${pdata.content}\n\n${hashtags}` : pdata.content
      try { await Share.share({ message: fullContent }) } catch (e) {}
    }
    setPublishing(false)
    setPublished(true)
    setTimeout(() => { reset(); navigation.navigate('Capture') }, 2000)
  }

  if (published) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
        <View style={s.successScreen}>
          <View style={[s.successIcon, { backgroundColor: theme.accentLight, borderColor: theme.accent }]}>
            <Text style={[s.successCheck, { color: theme.accent }]}>ok</Text>
          </View>
          <Text style={[s.successTitle, { color: theme.text }]}>{t.published}</Text>
          <Text style={[s.successSub, { color: theme.textMuted }]}>{activeCount} {t.platforms}</Text>
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
        {PLATFORMS.map(platform => {
          const pdata = result.platforms[platform.key as keyof typeof result.platforms]
          const isOn = enabled[platform.key as keyof typeof enabled]
          const isExp = expanded === platform.key
          const isEdit = editing === platform.key
          const hashtags = 'hashtags' in pdata ? (pdata as any).hashtags || [] : []
          return (
            <View key={platform.key} style={[s.card, { backgroundColor: theme.bgSecondary, borderColor: isOn ? platform.color + '44' : theme.border }]}>
              <TouchableOpacity style={s.cardHeader} onPress={() => setExpanded(isExp ? null : platform.key)}>
                <View style={[s.dot, { backgroundColor: isOn ? platform.color : theme.bgTertiary }]} />
                <Text style={[s.platformName, { color: isOn ? theme.text : theme.textMuted }]}>{platform.name}</Text>
                {!isExp && <Text style={[s.preview, { color: theme.textMuted }]} numberOfLines={1}>{pdata.content.slice(0, 35)}...</Text>}
                <Switch
                  value={isOn}
                  onValueChange={() => setEnabled(prev => ({ ...prev, [platform.key]: !prev[platform.key as keyof typeof prev] }))}
                  trackColor={{ false: theme.bgTertiary, true: platform.color + '44' }}
                  thumbColor={isOn ? platform.color : theme.textDisabled}
                  style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
                />
              </TouchableOpacity>
              {isExp && (
                <View style={s.cardBody}>
                  <View style={[s.divider, { backgroundColor: theme.border }]} />
                  {isEdit ? (
                    <>
                      <TextInput
                        style={[s.editInput, { color: theme.text, borderColor: theme.border }]}
                        value={editTexts[platform.key]}
                        onChangeText={text => setEditTexts(prev => ({ ...prev, [platform.key]: text }))}
                        multiline
                        autoFocus
                      />
                      <TouchableOpacity
                        style={[s.actionBtn, { borderColor: theme.accent + '44', backgroundColor: theme.accentLight }]}
                        onPress={() => { updatePlatformContent(platform.key, editTexts[platform.key]); setEditing(null) }}
                      >
                        <Text style={[s.actionBtnText, { color: theme.accent }]}>{t.save}</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity
                        style={[s.actionBtn, { borderColor: theme.border, alignSelf: 'flex-end', marginBottom: 10, marginTop: 0 }]}
                        onPress={() => { setEditTexts(prev => ({ ...prev, [platform.key]: pdata.content })); setEditing(platform.key) }}
                      >
                        <Text style={[s.actionBtnText, { color: theme.textMuted }]}>{t.edit}</Text>
                      </TouchableOpacity>
                      <Text style={[s.content, { color: theme.text }]}>{pdata.content}</Text>
                      {hashtags.length > 0 && <Text style={[s.hashtags, { color: theme.accent + '66' }]}>{hashtags.join(' ')}</Text>}
                    </>
                  )}
                </View>
              )}
            </View>
          )
        })}
        <View style={[s.recBox, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
          <Text style={[s.recText, { color: theme.accent }]}>{result.recommendation.bestPlatform} — {result.recommendation.bestDay} {result.recommendation.bestTime}</Text>
        </View>
        <TouchableOpacity style={[s.addPlatformBtn, { borderColor: theme.border, backgroundColor: theme.bgSecondary }]} onPress={() => {}}>
          <Text style={[s.addPlatformText, { color: theme.textMuted }]}>+ {t.lang === 'es' ? 'agregar plataforma' : 'add platform'}</Text>
        </TouchableOpacity>
      </ScrollView>
      <View style={[s.footer, { backgroundColor: theme.bg, borderTopColor: theme.bgSecondary }]}>
        <Text style={[s.activeCount, { color: theme.textMuted }]}>{activeCount} {t.lang === 'es' ? 'activas' : 'active'}</Text>
        <TouchableOpacity
          style={[s.publishBtn, { backgroundColor: theme.accent }, (activeCount === 0 || publishing) && { opacity: 0.4 }]}
          onPress={handlePublish}
          disabled={activeCount === 0 || publishing}
        >
          <Text style={[s.publishBtnText, { color: theme.bg }]}>{publishing ? (t.lang === 'es' ? 'compartiendo...' : 'sharing...') : t.publishNow}</Text>
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
  card: { borderRadius: 16, borderWidth: 0.5, marginBottom: 10, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  platformName: { fontSize: 14, fontWeight: '500', width: 80 },
  preview: { flex: 1, fontSize: 12 },
  cardBody: { paddingHorizontal: 14, paddingBottom: 14 },
  divider: { height: 0.5, marginBottom: 12 },
  content: { fontSize: 14, lineHeight: 22, fontWeight: '300' },
  hashtags: { marginTop: 8, fontSize: 12 },
  editInput: { fontSize: 14, lineHeight: 22, minHeight: 100, textAlignVertical: 'top', borderWidth: 0.5, borderRadius: 10, padding: 10, marginBottom: 8 },
  actionBtn: { alignSelf: 'flex-end', marginTop: 10, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, borderWidth: 0.5 },
  actionBtnText: { fontSize: 12 },
  recBox: { borderRadius: 12, borderWidth: 0.5, padding: 14, marginTop: 6 },
  recText: { fontSize: 12, lineHeight: 18 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 36, flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 0.5 },
  activeCount: { fontSize: 12 },
  publishBtn: { flex: 1, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  publishBtnText: { fontSize: 16, fontWeight: '500' },
  successScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  successIcon: { width: 72, height: 72, borderRadius: 36, borderWidth: 0.5, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  successCheck: { fontSize: 16 },
  successTitle: { fontSize: 28 },
  successSub: { fontSize: 13 },
  addPlatformBtn: { borderRadius: 16, borderWidth: 0.5, borderStyle: 'dashed', padding: 16, marginTop: 10, alignItems: 'center' },
  addPlatformText: { fontSize: 13, letterSpacing: 0.5 },
})
