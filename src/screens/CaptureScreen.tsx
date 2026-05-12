import React, { useRef, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView,
  ActivityIndicator, Animated, Easing
} from 'react-native'
import { useVoxaStore } from '../store/voxa.store'
import { useVoiceInput } from '../hooks/useVoiceInput'
import { useLanguage } from '../hooks/useLanguage'
import { Ionicons } from '@expo/vector-icons'

const TONES = ['auto', 'inspiracional', 'urgente', 'cercano', 'profesional', 'reflexivo', 'provocador']
const RECENT = ['liderazgo remoto', 'IA y creatividad', 'productividad']

export default function CaptureScreen({ navigation }: any) {
  const { input, tone, loading, error, setInput, setTone, generate } = useVoxaStore()
  const { isRecording, transcript, startRecording, stopRecording } = useVoiceInput()
  const { t } = useLanguage()
  const [showInput, setShowInput] = React.useState(false)

  const ring1 = useRef(new Animated.Value(0)).current
  const ring2 = useRef(new Animated.Value(0)).current
  const ring3 = useRef(new Animated.Value(0)).current

  const animateRing = (anim: Animated.Value, delay: number) =>
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true
        }),
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

  useEffect(() => {
    if (transcript) setInput(transcript)
  }, [transcript])

  const handleMicPress = () => {
    if (isRecording) stopRecording()
    else startRecording()
  }

  const handleGenerate = async () => {
    if (!input.trim()) return
    await generate()
    navigation.navigate('Review')
  }

  const makeRingStyle = (anim: Animated.Value) => ({
    opacity: anim.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.25, 0] }),
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.8] }) }]
  })

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        <View style={s.header}>
          <Text style={s.logo}>vox<Text style={s.logoAccent}>a</Text></Text>
          <Text style={s.greeting}>{t.greeting}</Text>
        </View>

        <View style={s.micArea}>
          <View style={s.micWrapper}>
            <Animated.View style={[s.ring, makeRingStyle(ring1)]} />
            <Animated.View style={[s.ring, makeRingStyle(ring2)]} />
            <Animated.View style={[s.ring, makeRingStyle(ring3)]} />
            <TouchableOpacity
              style={[s.micBtn, isRecording && s.micBtnActive]}
              onPress={handleMicPress}
              activeOpacity={0.85}
            >
              <Ionicons name='mic' size={38} color='#0a0a0a' />
            </TouchableOpacity>
          </View>
          <Text style={s.micLabel}>
            {isRecording ? (t.lang === 'es' ? 'ESCUCHANDO...' : 'LISTENING...') : t.micLabel}
          </Text>
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
                <TouchableOpacity
                  key={key}
                  style={[s.tonePill, tone === key && s.tonePillActive]}
                  onPress={() => setTone(key)}
                >
                  <Text style={[s.tonePillText, tone === key && s.tonePillTextActive]}>
                    {t.tones[key as keyof typeof t.tones]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {error && (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[s.generateBtn, (!input.trim() || loading) && s.generateBtnDisabled]}
          onPress={handleGenerate}
          disabled={!input.trim() || loading}
        >
          {loading
            ? <ActivityIndicator color="#0a0a0a" />
            : <Text style={s.generateBtnText}>{t.generate}</Text>
          }
        </TouchableOpacity>

        <View style={s.recentSection}>
          <Text style={s.sectionLabel}>{t.recentLabel}</Text>
          <View style={s.recentRow}>
            {RECENT.map(r => (
              <TouchableOpacity
                key={r}
                style={s.recentChip}
                onPress={() => { setInput(r); setShowInput(true) }}
              >
                <Text style={s.recentChipText}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0a0a0a' },
  scroll: { padding: 24, paddingTop: 48 },
  header: { marginBottom: 20 },
  logo: { fontSize: 32, color: '#f0ede8' },
  logoAccent: { color: '#c8b99a', fontStyle: 'italic' },
  greeting: { fontSize: 13, color: '#555', marginTop: 6 },
  micArea: { alignItems: 'center', paddingVertical: 32, marginBottom: 8 },
  micWrapper: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  ring: { position: 'absolute', width: 90, height: 90, borderRadius: 45, backgroundColor: '#c8b99a' },
  micBtn: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#c8b99a', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  micBtnActive: { backgroundColor: '#e05a4e' },
  micLabel: { fontSize: 11, color: '#666', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 },
  orWrite: { fontSize: 13, color: '#333', letterSpacing: 0.5 },
  inputContainer: { marginBottom: 24 },
  input: { backgroundColor: '#111', borderWidth: 0.5, borderColor: '#1e1e1e', borderRadius: 16, padding: 16, color: '#f0ede8', fontSize: 15, fontWeight: '300', minHeight: 90, lineHeight: 24 },
  toneSection: { marginBottom: 28 },
  sectionLabel: { fontSize: 10, color: '#444', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 },
  toneRow: { flexDirection: 'row', gap: 8 },
  tonePill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 0.5, borderColor: '#1e1e1e' },
  tonePillActive: { borderColor: '#c8b99a', backgroundColor: '#c8b99a12' },
  tonePillText: { fontSize: 12, color: '#aaa' },
  tonePillTextActive: { color: '#c8b99a' },
  errorBox: { backgroundColor: '#1a0a0a', borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { fontSize: 12, color: '#e05a4e' },
  generateBtn: { backgroundColor: '#c8b99a', borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  generateBtnDisabled: { opacity: 0.4 },
  generateBtnText: { fontSize: 17, color: '#0a0a0a', fontWeight: '500' },
  recentSection: { marginBottom: 24 },
  recentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  recentChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 0.5, borderColor: '#1e1e1e', backgroundColor: '#111' },
  recentChipText: { fontSize: 12, color: '#aaa' },
})
