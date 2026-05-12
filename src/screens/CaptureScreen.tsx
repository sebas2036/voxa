import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView, ActivityIndicator
} from 'react-native'
import { useVoxaStore } from '../store/voxa.store'
import { useVoiceInput } from '../hooks/useVoiceInput'

const TONES = [
  { key: 'auto', label: 'auto' },
  { key: 'inspiracional', label: 'inspiracional' },
  { key: 'urgente', label: 'urgente' },
  { key: 'cercano', label: 'cercano' },
  { key: 'profesional', label: 'profesional' },
  { key: 'reflexivo', label: 'reflexivo' },
  { key: 'provocador', label: 'provocador' },
]

const RECENT = ['liderazgo remoto', 'IA y creatividad', 'productividad']

export default function CaptureScreen({ navigation }: any) {
  const { input, tone, loading, error, setInput, setTone, generate } = useVoxaStore()
  const { isRecording, transcript, startRecording, stopRecording } = useVoiceInput()
  const handleMicPress = () => { if (isRecording) stopRecording(); else startRecording() }
  require('react').useEffect(() => { if (transcript) setInput(transcript) }, [transcript])

  const handleGenerate = async () => {
    if (!input.trim()) return
    await generate()
    navigation.navigate('Review')
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <Text style={s.logo}>vox<Text style={s.logoAccent}>a</Text></Text>
          <Text style={s.greeting}>que queres publicar hoy?</Text>
        </View>
        <View style={s.inputContainer}>
          <TextInput
            style={s.input}
            placeholder={"🇪🇸 escribi tu idea...  🇺🇸 type your idea..."}
            placeholderTextColor="#2e2e2e"
            value={input}
            onChangeText={setInput}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
        <View style={s.micSection}><TouchableOpacity style={[s.micBtn, isRecording && s.micBtnActive]} onPress={handleMicPress}><Text style={s.micIcon}>{isRecording ? '⏹' : '🎤'}</Text></TouchableOpacity><Text style={s.micLabel}>{isRecording ? 'escuchando...' : 'habla tu idea'}</Text></View>

                <View style={s.toneSection}>
          <Text style={s.sectionLabel}>tono</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={s.toneRow}>
              {TONES.map(t => (
                <TouchableOpacity
                  key={t.key}
                  style={[s.tonePill, tone === t.key && s.tonePillActive]}
                  onPress={() => setTone(t.key)}
                >
                  <Text style={[s.tonePillText, tone === t.key && s.tonePillTextActive]}>
                    {t.label}
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
            : <Text style={s.generateBtnText}>generar</Text>
          }
        </TouchableOpacity>
        <View style={s.recentSection}>
          <Text style={s.sectionLabel}>ideas recientes</Text>
          <View style={s.recentRow}>
            {RECENT.map(r => (
              <TouchableOpacity key={r} style={s.recentChip} onPress={() => setInput(r)}>
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
  header: { marginBottom: 32 },
  logo: { fontSize: 32, color: '#f0ede8' },
  logoAccent: { color: '#c8b99a' },
  greeting: { fontSize: 13, color: '#888', marginTop: 6 },
  inputContainer: { marginBottom: 24 },
  input: {
    backgroundColor: '#111', borderWidth: 0.5, borderColor: '#1e1e1e',
    borderRadius: 16, padding: 16, color: '#f0ede8', fontSize: 15, minHeight: 120
  },
  toneSection: { marginBottom: 28 },
  sectionLabel: { fontSize: 10, color: '#666', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 },
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
  micSection: { alignItems: 'center', marginBottom: 24 },
  micBtn: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#c8b99a', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  micBtnActive: { backgroundColor: '#e05a4e' },
  micIcon: { fontSize: 36 },
  micLabel: { fontSize: 11, color: '#555', letterSpacing: 1 },
  recentChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 0.5, borderColor: '#1e1e1e', backgroundColor: '#111' },
  recentChipText: { fontSize: 12, color: '#aaa' },
})
