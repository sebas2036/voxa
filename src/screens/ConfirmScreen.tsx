import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Switch } from 'react-native'
import { useVoxaStore } from '../store/voxa.store'
import { useLanguage } from '../hooks/useLanguage'

const PLATFORMS = [
  { key: 'twitter', name: 'X', color: '#c8b99a' },
  { key: 'linkedin', name: 'LinkedIn', color: '#4a9eff' },
  { key: 'threads', name: 'Threads', color: '#aaa' },
  { key: 'instagram', name: 'Instagram', color: '#e1306c' },
]

export default function ConfirmScreen({ navigation }: any) {
  const { result, reset } = useVoxaStore()
  const { t } = useLanguage()
  const [enabled, setEnabled] = useState({ twitter: true, linkedin: true, threads: true, instagram: true })
  const [published, setPublished] = useState(false)

  if (!result) { navigation.navigate('Capture'); return null }

  const activeCount = Object.values(enabled).filter(Boolean).length
  const toggle = (key: string) => setEnabled((prev: any) => ({ ...prev, [key]: !prev[key] }))

  const handlePublish = () => {
    setPublished(true)
    setTimeout(() => { reset(); navigation.navigate('Capture') }, 2500)
  }

  if (published) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.successScreen}>
          <View style={s.successIcon}><Text style={s.successCheck}>ok</Text></View>
          <Text style={s.successTitle}>{t.published}</Text>
          <Text style={s.successSub}>{activeCount} {t.platforms}</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backBtn}>{t.back}</Text>
        </TouchableOpacity>
        <Text style={s.title}>{t.readyToPublish}</Text>
        <View style={{ width: 48 }} />
      </View>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.ideaRecap}>
          <Text style={s.ideaRecapText}>{result.analysis.topic}</Text>
        </View>
        <Text style={s.sectionLabel}>{t.platforms}</Text>
        {PLATFORMS.map(p => {
          const pdata = result.platforms[p.key as keyof typeof result.platforms]
          const isOn = enabled[p.key as keyof typeof enabled]
          return (
            <View key={p.key} style={[s.platformRow, isOn && s.platformRowOn]}>
              <View style={[s.platformDot, { backgroundColor: isOn ? p.color : '#222' }]} />
              <View style={s.platformInfo}>
                <Text style={[s.platformName, isOn && s.platformNameOn]}>{p.name}</Text>
                <Text style={s.platformPreview} numberOfLines={1}>{pdata.content.slice(0, 50)}...</Text>
              </View>
              <Switch
                value={isOn}
                onValueChange={() => toggle(p.key)}
                trackColor={{ false: '#1a1a1a', true: '#c8b99a44' }}
                thumbColor={isOn ? '#c8b99a' : '#333'}
              />
            </View>
          )
        })}
        <View style={s.recBox}>
          <Text style={s.recText}>
            {result.recommendation.bestPlatform} — {result.recommendation.bestDay} {result.recommendation.bestTime}
          </Text>
        </View>
      </ScrollView>
      <View style={s.footer}>
        <TouchableOpacity style={s.scheduleBtn} onPress={() => alert(t.comingSoon)}>
          <Text style={s.scheduleBtnText}>{t.schedule}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.publishBtn, activeCount === 0 && s.publishBtnDisabled]}
          onPress={handlePublish}
          disabled={activeCount === 0}
        >
          <Text style={s.publishBtnText}>{t.publishNow}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0a0a0a' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backBtn: { fontSize: 14, color: '#444' },
  title: { fontSize: 16, color: '#f0ede8' },
  scroll: { padding: 20, paddingBottom: 120 },
  ideaRecap: { backgroundColor: '#111', borderRadius: 14, borderWidth: 0.5, borderColor: '#1e1e1e', padding: 14, marginBottom: 24 },
  ideaRecapText: { fontSize: 13, color: '#aaa', fontStyle: 'italic' },
  sectionLabel: { fontSize: 10, color: '#555', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 },
  platformRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 14, borderWidth: 0.5, borderColor: '#1e1e1e', padding: 14, marginBottom: 10, gap: 12 },
  platformRowOn: { borderColor: '#c8b99a22' },
  platformDot: { width: 10, height: 10, borderRadius: 5 },
  platformInfo: { flex: 1 },
  platformName: { fontSize: 13, color: '#fff', fontWeight: '500' },
  platformNameOn: { color: '#888' },
  platformPreview: { fontSize: 11, color: '#888', marginTop: 2 },
  recBox: { backgroundColor: '#111', borderRadius: 12, borderWidth: 0.5, borderColor: '#1e1e1e', padding: 14, marginTop: 24 },
  recText: { fontSize: 13, color: '#c8b99a', lineHeight: 20 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 36, flexDirection: 'row', gap: 10, backgroundColor: '#0a0a0a', borderTopWidth: 0.5, borderTopColor: '#111' },
  scheduleBtn: { flex: 1, height: 52, borderRadius: 14, borderWidth: 0.5, borderColor: '#1e1e1e', alignItems: 'center', justifyContent: 'center' },
  scheduleBtnText: { fontSize: 14, color: '#aaa' },
  publishBtn: { flex: 1.6, height: 52, borderRadius: 14, backgroundColor: '#c8b99a', alignItems: 'center', justifyContent: 'center' },
  publishBtnDisabled: { opacity: 0.3 },
  publishBtnText: { fontSize: 16, color: '#0a0a0a', fontWeight: '500' },
  successScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  successIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#c8b99a18', borderWidth: 0.5, borderColor: '#c8b99a33', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  successCheck: { fontSize: 16, color: '#c8b99a' },
  successTitle: { fontSize: 28, color: '#f0ede8' },
  successSub: { fontSize: 13, color: '#333' },
})
