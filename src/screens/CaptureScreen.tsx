import React, { useRef, useEffect, useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView,
  ActivityIndicator, Animated, Easing
} from 'react-native'
import { useVoxaStore } from '../store/voxa.store'
import { useVoiceInput } from '../hooks/useVoiceInput'
import { useLanguage } from '../hooks/useLanguage'
import { Ionicons } from '@expo/vector-icons'
import { FontAwesome5, FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons'

const TONES = ['auto', 'inspiracional', 'urgente', 'cercano', 'profesional', 'reflexivo', 'provocador']

const PLATFORM_ICONS = [
  { icon: 'x-twitter', lib: 'fa6', color: '#c8b99a', name: 'X' },
  { icon: 'linkedin', lib: 'fa5', color: '#4a9eff', name: 'LinkedIn' },
  { icon: 'T', lib: 'text', color: '#c8b99a', name: 'Threads' },
  { icon: 'instagram', lib: 'fa5', color: '#e1306c', name: 'Instagram' },
]

const HINTS = ['hablá', 'revisá', 'publicá']

export default function CaptureScreen({ navigation }: any) {
  const { input, tone, loading, error, recentIdeas, setInput, setTone, generate, loadRecentIdeas } = useVoxaStore()
  const { isRecording, transcript, startRecording, stopRecording } = useVoiceInput()
  const { t } = useLanguage()
  const [showInput, setShowInput] = useState(false)
  const [recentOpen, setRecentOpen] = useState(false)
  const [hintIndex, setHintIndex] = useState(0)

  const ring1 = useRef(new Animated.Value(0)).current
  const ring2 = useRef(new Animated.Value(0)).current
  const ring3 = useRef(new Animated.Value(0)).current
  const recentAnim = useRef(new Animated.Value(0)).current
  const hintOpacity = useRef(new Animated.Value(1)).current

  useEffect(() => { loadRecentIdeas() }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(hintOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => {
        setHintIndex(i => (i + 1) % HINTS.length)
        Animated.timing(hintOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start()
      })
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    Animated.timing(recentAnim, {
      toValue: recentOpen ? 1 : 0,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false
    }).start()
  }, [recentOpen])

  const animateRing = (anim: Animated.Value, delay: number) =>
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 2000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    )

  useEffect(() => {
    if (isRecording) {
      animateRing(ring1, 0).start()
      animateRing(ring2, 600).start()
      animateRing(ring3, 1200).start()
    } else {
      ring1.stopAnimation(); ring1.setValue(0)
      ring2.stopAnimation(); ring2.setValue(0)
      ring3.stopAnimation(); ring3.setValue(0)
    }
  }, [isRecording])

  useEffect(() => { if (transcript) setInput(transcript) }, [transcript])

  const handleMicPress = () => { if (isRecording) stopRecording(); else startRecording() }

  const handleGenerate = async () => {
    if (!input.trim()) return
    await generate()
    navigation.navigate('Review')
  }

  const makeRingStyle = (anim: Animated.Value) => ({
    opacity: anim.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.25, 0] }),
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.8] }) }]
  })

  const recentHeight = recentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.min(recentIdeas.length, 5) * 44 + 16]
  })

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        <View style={s.header}>
          <View style={s.headerTop}>
            <Text style={s.logo}>vox<Text style={s.logoAccent}>a</Text></Text>
            <TouchableOpacity style={s.menuBtn} onPress={() => navigation.navigate('Settings')}>
              <View style={s.menuLine} />
              <View style={s.menuLine} />
              <View style={s.menuLine} />
            </TouchableOpacity>
          </View>
          <Text style={s.tagline}>{t.lang === 'es' ? 'tu idea, en todas tus redes' : 'your idea, across all your networks'}</Text>
        </View>

        <View style={s.micArea}>
          <View style={s.micWrapper}>
            <Animated.View style={[s.ring, makeRingStyle(ring1)]} />
            <Animated.View style={[s.ring, makeRingStyle(ring2)]} />
            <Animated.View style={[s.ring, makeRingStyle(ring3)]} />
            <TouchableOpacity style={[s.micBtn, isRecording && s.micBtnActive]} onPress={handleMicPress} activeOpacity={0.85}>
              <Ionicons name="mic" size={38} color="#0a0a0a" />
            </TouchableOpacity>
          </View>
          <Animated.Text style={[s.hintText, { opacity: hintOpacity }]}>{HINTS[hintIndex]}</Animated.Text>
          <TouchableOpacity onPress={() => setShowInput(!showInput)}>
            <Text style={s.orWrite}>{t.orWrite}</Text>
          </TouchableOpacity>
        </View>

        {(showInput || input.length > 0) && (
          <View style={s.inputContainer}>
            <TextInput
              style={s.input}
              placeholder={t.placeholder}
              placeholderTextColor="#2e2e2e"
              value={input}
              onChangeText={setInput}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              autoFocus={showInput}
            />
          </View>
        )}

        <View style={s.toneSection}>
          <Text style={s.sectionLabel}>{t.toneLabel}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={s.toneRow}>
              {TONES.map(key => (
                <TouchableOpacity key={key} style={[s.tonePill, tone === key && s.tonePillActive]} onPress={() => setTone(key)}>
                  <Text style={[s.tonePillText, tone === key && s.tonePillTextActive]}>
                    {t.tones[key as keyof typeof t.tones]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {error && <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View>}

        <TouchableOpacity
          style={[s.generateBtn, (!input.trim() || loading) && s.generateBtnDisabled]}
          onPress={handleGenerate}
          disabled={!input.trim() || loading}
        >
          {loading ? <ActivityIndicator color="#0a0a0a" /> : <Text style={s.generateBtnText}>{t.generate}</Text>}
        </TouchableOpacity>

        {recentIdeas.length > 0 && (
          <View style={s.recentSection}>
            <TouchableOpacity style={s.recentHeader} onPress={() => setRecentOpen(!recentOpen)}>
              <Text style={s.recentLabel}>{t.recentLabel}</Text>
              <Ionicons name={recentOpen ? "chevron-up" : "chevron-down"} size={14} color="#888" />
            </TouchableOpacity>
            <Animated.View style={{ height: recentHeight, overflow: "hidden" }}>
              {recentIdeas.slice(0, 5).map((idea, i) => (
                <TouchableOpacity
                  key={i}
                  style={s.recentItem}
                  onPress={() => { setInput(idea); setShowInput(true); setRecentOpen(false) }}
                >
                  <Ionicons name="time-outline" size={13} color="#444" style={{ marginRight: 8 }} />
                  <Text style={s.recentItemText} numberOfLines={1}>{idea}</Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          </View>
        )}

        <View style={s.flowDots}>
          {[0,1,2,3].map(i => <View key={i} style={s.flowDot} />)}
        </View>

        <View style={s.platformsRow}>
          {PLATFORM_ICONS.map((p, i) => (
            <View key={i} style={s.platformBadge}>
              <View style={[s.platformDot, { backgroundColor: p.color + '22', borderColor: p.color + '44' }]}>
                {p.lib === 'fa6' && <FontAwesome6 name={p.icon} size={18} color={p.color} />}
                {p.lib === 'fa5' && <FontAwesome5 name={p.icon} size={18} color={p.color} />}
                {p.lib === 'text' && <Text style={[s.platformLetter, { color: p.color }]}>T</Text>}
              </View>
              <Text style={[s.platformName, { color: p.color }]}>{p.name}</Text>
            </View>
          ))}
             </View>

      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0a0a0a" },
  scroll: { padding: 24, paddingTop: 48 },
  header: { marginBottom: 20 },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  menuBtn: { padding: 8, gap: 5, alignItems: "flex-end" },
  menuLine: { width: 22, height: 1.5, backgroundColor: "#555", borderRadius: 2 },
  logo: { fontSize: 32, color: "#f0ede8" },
  logoAccent: { color: "#c8b99a", fontStyle: "italic" },
  tagline: { fontSize: 12, color: "#444", marginTop: 4, letterSpacing: 0.3 },
  micArea: { alignItems: "center", paddingVertical: 24, marginBottom: 8 },
  micWrapper: { width: 160, height: 160, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  ring: { position: "absolute", width: 90, height: 90, borderRadius: 45, backgroundColor: "#c8b99a" },
  micBtn: { width: 90, height: 90, borderRadius: 45, backgroundColor: "#c8b99a", alignItems: "center", justifyContent: "center", zIndex: 10 },
  micBtnActive: { backgroundColor: "#e05a4e" },
  hintText: { fontSize: 13, color: "#555", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 },
  orWrite: { fontSize: 13, color: "#2a2a2a", letterSpacing: 0.5 },
  inputContainer: { marginBottom: 24 },
  input: { backgroundColor: "#111", borderWidth: 0.5, borderColor: "#1e1e1e", borderRadius: 16, padding: 16, color: "#f0ede8", fontSize: 15, fontWeight: "300", minHeight: 90, lineHeight: 24 },
  toneSection: { marginBottom: 28 },
  sectionLabel: { fontSize: 10, color: "#666", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 },
  toneRow: { flexDirection: "row", gap: 8 },
  tonePill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 0.5, borderColor: "#1e1e1e" },
  tonePillActive: { borderColor: "#c8b99a", backgroundColor: "#c8b99a12" },
  tonePillText: { fontSize: 12, color: "#ccc" },
  tonePillTextActive: { color: "#c8b99a" },
  errorBox: { backgroundColor: "#1a0a0a", borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { fontSize: 12, color: "#e05a4e" },
  generateBtn: { backgroundColor: "#c8b99a", borderRadius: 14, height: 52, alignItems: "center", justifyContent: "center", marginBottom: 24 },
  generateBtnDisabled: { opacity: 0.4 },
  generateBtnText: { fontSize: 17, color: "#0a0a0a", fontWeight: "500" },
  recentSection: { marginBottom: 24 },
  recentHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: "#1a1a1a" },
  recentLabel: { fontSize: 11, color: "#aaa", letterSpacing: 2, textTransform: "uppercase" },
  recentItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: "#111" },
  recentItemText: { fontSize: 13, color: "#999", flex: 1 },
  flowDots: { flexDirection: "row", justifyContent: "center", gap: 6, marginBottom: 4 },
  flowDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#333" },
  platformsRow: { flexDirection: "row", justifyContent: "center", gap: 16, paddingVertical: 8, marginTop: 0 },
  platformBadge: { alignItems: "center", gap: 6 },
  platformName: { fontSize: 9, letterSpacing: 0.5, textTransform: "uppercase", opacity: 0.7 },
  platformDot: { width: 44, height: 44, borderRadius: 22, borderWidth: 0.5, alignItems: "center", justifyContent: "center" },
  platformLetter: { fontSize: 17, fontWeight: '900', letterSpacing: -0.5 },
})
