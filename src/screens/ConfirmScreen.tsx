import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Switch, Share, Alert } from 'react-native'
import { useVoxaStore } from '../store/voxa.store'
import { useLanguage } from '../hooks/useLanguage'
import { useTheme } from '../theme'

const PLATFORMS = [
  { key: 'twitter', name: 'X', color: '#c8b99a' },
  { key: 'linkedin', name: 'LinkedIn', color: '#4a9eff' },
  { key: 'threads', name: 'Threads', color: '#c8b99a' },
  { key: 'instagram', name: 'Instagram', color: '#e1306c' },
]

export default function ConfirmScreen({ navigation }: any) {
  const { result, reset } = useVoxaStore()
  const { t } = useLanguage()
  const theme = useTheme()
  const [enabled, setEnabled] = useState({ twitter: true, linkedin: true, threads: true, instagram: true })
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)

  React.useEffect(() => { if (!result) navigation.navigate('Capture') }, [result])
  if (!result) return null

  const activeCount = Object.values(enabled).filter(Boolean).length
  const toggle = (key: string) => setEnabled((prev: any) => ({ ...prev, [key]: !prev[key] }))

  const handlePublish = async () => {
    setPublishing(true)
    const activePlatforms = PLATFORMS.filter(p => enabled[p.key as keyof typeof enabled])
    for (const platform of activePlatforms) {
      const pdata = result.platforms[platform.key as keyof typeof result.platforms]
      const hashtags = 'hashtags' in pdata ? (pdata as any).hashtags?.join(' ') : ''
      const fullContent = hashtags ? `${pdata.content}

${hashtags}` : pdata.content
      try {
        await Share.share({ message: fullContent, title: `Voxa → ${platform.name}` })
      } catch (e) {}
    }
    setPublishing(false)
    setPublished(true)
    setTimeout(() => { reset(); navigation.navigate('Capture') }, 2000)
  }

  if (published) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
        <View style={s.successScreen}>
          <View style={[s.successIcon, { backgroundColor: theme.accentLight, borderColor: theme.accent + '33' }]}>
            <Text style={[s.successCheck, { color: theme.accent }]}>✓</Text>
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[s.backBtn, { color: theme.textSecondary }]}>{t.back}</Text>
        </TouchableOpacity>
        <Text style={[s.title, { color: theme.text }]}>{t.readyToPublish}</Text>
        <View style={{ width: 48 }} />
      </View>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={[s.ideaRecap, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
          <Text style={[s.ideaRecapText, { color: theme.textSecondary }]}>{result.analysis.topic}</Text>
        </View>
        <Text style={[s.sectionLabel, { color: theme.textSecondary }]}>{t.platforms}</Text>
        {PLATFORMS.map(p => {
          const pdata = result.platforms[p.key as keyof typeof result.platforms]
          const isOn = enabled[p.key as keyof typeof enabled]
          return (
            <View key={p.key} style={[s.platformRow, { backgroundColor: theme.bgSecondary, borderColor: theme.border }, isOn && { borderColor: theme.accent + '22' }]}>
              <View style={[s.platformDot, { backgroundColor: isOn ? p.color : theme.bgTertiary }]} />
              <View style={s.platformInfo}>
                <Text style={[s.platformName, { color: isOn ? theme.text : theme.textMuted }]}>{p.name}</Text>
                <Text style={[s.platformPreview, { color: theme.textMuted }]} numberOfLines={1}>{pdata.content.slice(0, 50)}...</Text>
              </View>
              <Switch
                value={isOn}
                onValueChange={() => toggle(p.key)}
                trackColor={{ false: theme.bgTertiary, true: theme.accent + '44' }}
                thumbColor={isOn ? theme.accent : theme.textDisabled}
              />
            </View>
          )
        })}
        <View style={[s.recBox, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
          <Text style={[s.recText, { color: theme.accent }]}>
            {result.recommendation.bestPlatform} — {result.recommendation.bestDay} {result.recommendation.bestTime}
          </Text>
        </View>
        <View style={[s.infoBox, { backgroundColor: theme.bgTertiary }]}>
          <Text style={[s.infoText, { color: theme.textMuted }]}>
            {t.lang === 'es' ? `Se abrirá el share sheet para cada plataforma activa (${activeCount})` : `Share sheet will open for each active platform (${activeCount})`}
          </Text>
        </View>
      </ScrollView>
      <View style={[s.footer, { backgroundColor: theme.bg, borderTopColor: theme.bgSecondary }]}>
        <TouchableOpacity style={[s.scheduleBtn, { borderColor: theme.border }]} onPress={() => Alert.alert(t.comingSoon)}>
          <Text style={[s.scheduleBtnText, { color: theme.textSecondary }]}>{t.schedule}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.publishBtn, { backgroundColor: theme.accent }, (activeCount === 0 || publishing) && s.publishBtnDisabled]}
          onPress={handlePublish}
          disabled={activeCount === 0 || publishing}
        >
          <Text style={[s.publishBtnText, { color: theme.bg }]}>
            {publishing ? (t.lang === 'es' ? 'compartiendo...' : 'sharing...') : t.publishNow}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backBtn: { fontSize: 14 },
  title: { fontSize: 16 },
  scroll: { padding: 20, paddingBottom: 120 },
  ideaRecap: { borderRadius: 14, borderWidth: 0.5, padding: 14, marginBottom: 24 },
  ideaRecapText: { fontSize: 13, fontStyle: 'italic' },
  sectionLabel: { fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 },
  platformRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 0.5, padding: 14, marginBottom: 10, gap: 12 },
  platformDot: { width: 10, height: 10, borderRadius: 5 },
  platformInfo: { flex: 1 },
  platformName: { fontSize: 13, fontWeight: '500' },
  platformPreview: { fontSize: 11, marginTop: 2 },
  recBox: { borderRadius: 12, borderWidth: 0.5, padding: 14, marginTop: 24 },
  recText: { fontSize: 13, lineHeight: 20 },
  infoBox: { borderRadius: 10, padding: 12, marginTop: 12 },
  infoText: { fontSize: 11, textAlign: 'center', lineHeight: 16 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 36, flexDirection: 'row', gap: 10, borderTopWidth: 0.5 },
  scheduleBtn: { flex: 1, height: 52, borderRadius: 14, borderWidth: 0.5, alignItems: 'center', justifyContent: 'center' },
  scheduleBtnText: { fontSize: 14 },
  publishBtn: { flex: 1.6, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  publishBtnDisabled: { opacity: 0.3 },
  publishBtnText: { fontSize: 16, fontWeight: '500' },
  successScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  successIcon: { width: 72, height: 72, borderRadius: 36, borderWidth: 0.5, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  successCheck: { fontSize: 24 },
  successTitle: { fontSize: 28 },
  successSub: { fontSize: 13 },
})
