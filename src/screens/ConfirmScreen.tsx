import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Switch, Share, Alert } from 'react-native'
import { useVoxaStore } from '../store/voxa.store'
import { useLanguage } from '../hooks/useLanguage'

const PLATFORMS = [
  { key: 'twitter', name: 'X', color: '#c8b99a' },
  { key: 'linkedin', name: 'LinkedIn', color: '#4a9eff' },
  { key: 'threads', name: 'Threads', color: '#c8b99a' },
  { key: 'instagram', name: 'Instagram', color: '#e1306c' },
]

export default function ConfirmScreen({ navigation }: any) {
  const { result, reset } = useVoxaStore()
  const { t } = useLanguage()
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
        await Share.share({
          message: fullContent,
          title: `Voxa → ${platform.name}`,
        })
      } catch (e) {
        // usuario canceló, continuar con la siguiente
      }
    }

    setPublishing(false)
    setPublished(true)
    setTimeout(() => { reset(); navigation.navigate('Capture') }, 2000)
  }

  if (published) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.successScreen}>
          <View style={s.successIcon}><Text style={s.successCheck}>✓</Text></View>
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
        <View style={s.infoBox}>
          <Text style={s.infoText}>
            {t.lang === 'es' 
              ? `Se abrirá el share sheet para cada plataforma activa (${activeCount})`
              : `Share sheet will open for each active platform (${activeCount})`
            }
          </Text>
        </View>
      </ScrollView>
      <View style={s.footer}>
        <TouchableOpacity style={s.scheduleBtn} onPress={() => Alert.alert(t.comingSoon)}>
          <Text style={s.scheduleBtnText}>{t.schedule}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.publishBtn, (activeCount === 0 || publishing) && s.publishBtnDisabled]}
          onPress={handlePublish}
          disabled={activeCount === 0 || publishing}
        >
          <Text style={s.publishBtnText}>
            {publishing 
              ? (t.lang === 'es' ? 'compartiendo...' : 'sharing...') 
              : t.publishNow
            }
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0a0a0a' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backBtn: { fontSize: 14, color: '#888' },
  title: { fontSize: 16, color: '#f0ede8' },
  scroll: { padding: 20, paddingBottom: 120 },
  ideaRecap: { backgroundColor: '#111', borderRadius: 14, borderWidth: 0.5, borderColor: '#1e1e1e', padding: 14, marginBottom: 24 },
  ideaRecapText: { fontSize: 13, color: '#ccc', fontStyle: 'italic' },
  sectionLabel: { fontSize: 10, color: '#888', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 },
  platformRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 14, borderWidth: 0.5, borderColor: '#1e1e1e', padding: 14, marginBottom: 10, gap: 12 },
  platformRowOn: { borderColor: '#c8b99a22' },
  platformDot: { width: 10, height: 10, borderRadius: 5 },
  platformInfo: { flex: 1 },
  platformName: { fontSize: 13, color: '#fff', fontWeight: '500' },
  platformNameOn: { color: '#888' },
  platformPreview: { fontSize: 11, color: '#ccc', marginTop: 2 },
  recBox: { backgroundColor: '#111', borderRadius: 12, borderWidth: 0.5, borderColor: '#1e1e1e', padding: 14, marginTop: 24 },
  recText: { fontSize: 13, color: '#c8b99a', lineHeight: 20 },
  infoBox: { backgroundColor: '#0f0f0f', borderRadius: 10, padding: 12, marginTop: 12 },
  infoText: { fontSize: 11, color: '#888', textAlign: 'center', lineHeight: 16 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 36, flexDirection: 'row', gap: 10, backgroundColor: '#0a0a0a', borderTopWidth: 0.5, borderTopColor: '#111' },
  scheduleBtn: { flex: 1, height: 52, borderRadius: 14, borderWidth: 0.5, borderColor: '#1e1e1e', alignItems: 'center', justifyContent: 'center' },
  scheduleBtnText: { fontSize: 14, color: '#ccc' },
  publishBtn: { flex: 1.6, height: 52, borderRadius: 14, backgroundColor: '#c8b99a', alignItems: 'center', justifyContent: 'center' },
  publishBtnDisabled: { opacity: 0.3 },
  publishBtnText: { fontSize: 16, color: '#0a0a0a', fontWeight: '500' },
  successScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  successIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#c8b99a18', borderWidth: 0.5, borderColor: '#c8b99a33', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  successCheck: { fontSize: 24, color: '#c8b99a' },
  successTitle: { fontSize: 28, color: '#f0ede8' },
  successSub: { fontSize: 13, color: '#333' },
})
