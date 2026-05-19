import React, { useRef, useEffect, useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, SafeAreaView, ScrollView,
  ActivityIndicator, Animated, Easing, Alert, PanResponder
} from 'react-native'
import { useGlosXStore } from '../store/glosx.store'
import { useVoiceInput } from '../hooks/useVoiceInput'
import { useLanguage } from '../hooks/useLanguage'
import { useTheme } from '../theme'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons, FontAwesome5, FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons'
import { MicButton } from '../components/MicButton'
import { useNetworkStatus } from '../hooks/useNetworkStatus'

const TONES = ['auto', 'inspiracional', 'urgente', 'cercano', 'profesional', 'reflexivo', 'provocador']

const ALL_PLATFORM_ICONS: Record<string, { icon: string, lib: string, color: string, name: string }> = {
  twitter: { icon: 'x-twitter', lib: 'fa6', color: '#888888', name: 'X' },
  linkedin: { icon: 'linkedin', lib: 'fa5', color: '#4a9eff', name: 'LinkedIn' },
  threads: { icon: 'T', lib: 'text', color: '#444444', name: 'Threads' },
  instagram: { icon: 'instagram', lib: 'fa5', color: '#e1306c', name: 'Instagram' },
  whatsapp: { icon: 'whatsapp', lib: 'fa5', color: '#25D366', name: 'WhatsApp' },
  telegram: { icon: 'telegram', lib: 'fa5', color: '#2AABEE', name: 'Telegram' },
  tiktok: { icon: 'tiktok', lib: 'fa6', color: '#333333', name: 'TikTok' },
  facebook: { icon: 'facebook', lib: 'fa5', color: '#1877F2', name: 'Facebook' },
  pinterest: { icon: 'pinterest', lib: 'fa5', color: '#E60023', name: 'Pinterest' },
  reddit: { icon: 'reddit', lib: 'fa5', color: '#FF4500', name: 'Reddit' },
}

const HINTS_ES = ['hablá', 'revisá', 'publicá']
const HINTS_MAP: Record<string, string[]> = {
  es: ['hablá', 'revisá', 'publicá'],
  en: ['speak', 'review', 'publish'],
  zh: ['说', '审阅', '发布'],
  hi: ['बोलें', 'समीक्षा', 'प्रकाशित'],
  ar: ['تحدث', 'راجع', 'انشر'],
  pt: ['fale', 'revise', 'publique'],
  ru: ['говорите', 'просмотр', 'публикуй'],
  ja: ['話す', 'レビュー', '投稿'],
  fr: ['parlez', 'révisez', 'publiez'],
  de: ['sprechen', 'überprüfen', 'veröffentlichen'],
}
const LOADING_ES = ['analizando...', 'generando...', 'casi listo...']
const LOADING_EN = ['analyzing...', 'generating...', 'almost there...']
const HINTS_EN = ['speak', 'review', 'publish']

type MicState = 'idle' | 'recording' | 'thinking' | 'generating' | 'ready'

const MIC_STATES = {
  idle:       { color: '#c8b99a', pulseSpeed: 2400, pulseScale: 1.8, hints_es: ['hablá', 'escribí', 'contame'], hints_en: ['speak', 'write', 'tell me'] },
  recording:  { color: '#ff3b30', pulseSpeed: 800,  pulseScale: 2.2, hints_es: ['escuchando...', 'seguí hablando...', 'te escucho...'], hints_en: ['listening...', 'keep talking...', "I'm listening..."] },
  thinking:   { color: '#4a9eff', pulseSpeed: 1200, pulseScale: 2.0, hints_es: ['procesando...', 'entendiendo...', 'pensando...'], hints_en: ['processing...', 'understanding...', 'thinking...'] },
  generating: { color: '#2e7d52', pulseSpeed: 1600, pulseScale: 2.6, hints_es: ['armando tu historia...', 'dándole forma...', 'encontrando las palabras...'], hints_en: ['building your story...', 'shaping it...', 'finding the words...'] },
  ready:      { color: '#c8b99a', pulseSpeed: 400,  pulseScale: 1.4, hints_es: ['listo ✓', 'mirá esto ✓', 'está listo ✓'], hints_en: ['ready ✓', 'check this out ✓', "it's ready ✓"] },
}

export default function CaptureScreen({ navigation }: any) {
  const { input, tone, loading, error, recentIdeas, setInput, setTone, generate, generateProgressive, loadRecentIdeas, removeRecentIdea, clearRecentIdeas } = useGlosXStore()
  const { isRecording, transcript, startRecording, stopRecording } = useVoiceInput()
  const { t } = useLanguage()
  const theme = useTheme()
  const [showInput, setShowInput] = useState(false)
  const [activePlatformKeys, setActivePlatformKeys] = useState<string[]>(['twitter', 'threads', 'instagram', 'reddit'])
  const [loadingStep, setLoadingStep] = useState(0)
  const [recentOpen, setRecentOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [hintIndex, setHintIndex] = useState(0)
  const [micState, setMicState] = useState<MicState>('idle')
  const [mediaUri, setMediaUri] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null)
  const { isOnline } = useNetworkStatus()
  const [emotionalHintIndex, setEmotionalHintIndex] = useState(0)
  const micColor = useRef(new Animated.Value(0)).current
  const ring1 = useRef(new Animated.Value(0)).current
  const ring2 = useRef(new Animated.Value(0)).current
  const ring3 = useRef(new Animated.Value(0)).current
  const recentAnim = useRef(new Animated.Value(0)).current
  const hintOpacity = useRef(new Animated.Value(1)).current
  const btnWidth = useRef(new Animated.Value(1)).current

  useEffect(() => {
    loadRecentIdeas()
    AsyncStorage.getItem('glosx_last_platforms').then(val => {
      if (val) {
        const keys = JSON.parse(val)
        if (keys.length > 0) setActivePlatformKeys(keys)
      }
    })
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(hintOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => {
        setHintIndex(i => (i + 1) % (HINTS_MAP[t.lang] || HINTS_ES).length)
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

  const animateRing = (anim: Animated.Value, delay: number, speed: number = 2000) =>
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: speed, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    )

  useEffect(() => {
    const speed = MIC_STATES[micState].pulseSpeed
    const delay = speed / 3
    if (micState !== 'idle') {
      animateRing(ring1, 0, speed).start()
      animateRing(ring2, delay, speed).start()
      animateRing(ring3, delay * 2, speed).start()
    } else {
      ring1.stopAnimation(); ring1.setValue(0)
      ring2.stopAnimation(); ring2.setValue(0)
      ring3.stopAnimation(); ring3.setValue(0)
    }
  }, [micState])

  useEffect(() => { if (transcript) { setInput(transcript); setMicState('idle') } }, [transcript])

  const handleMicPress = () => { if (isRecording) { stopRecording(); setMicState('thinking') } else { startRecording(); setMicState('recording') } }

  const handlePickMedia = async (useCamera: boolean) => {
    const perm = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      Alert.alert(
        t.lang === 'es' ? 'Permiso requerido' : 'Permission required',
        t.lang === 'es' ? 'Necesitamos acceso a tu galería/cámara.' : 'We need access to your gallery/camera.'
      )
      return
    }
    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images', 'videos'], quality: 0.8, videoMaxDuration: 60 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images', 'videos'], quality: 0.8, videoMaxDuration: 60 })
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0]
      setMediaUri(asset.uri)
      setMediaType(asset.type === 'video' ? 'video' : 'image')
    }
  }

  const handleRemoveMedia = () => { setMediaUri(null); setMediaType(null) }

  const handleGenerate = async () => {
    if (!input.trim()) return
    setLoadingStep(0)
    setIsGenerating(true)
    setMicState('generating')
    await generateProgressive()
    setMicState('ready')
    setTimeout(() => { setIsGenerating(false); setMicState('idle'); navigation.navigate('Review') }, 1200)
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
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        <View style={s.header}>
          <View style={s.headerTop}>
            <Text style={[s.logo, { color: theme.text }]}>Glos<Text style={[s.logoAccent, { color: theme.accent }]}>X</Text></Text>
            <TouchableOpacity style={s.menuBtn} onPress={() => navigation.navigate('Settings')}>
              <View style={[s.menuLine, { backgroundColor: theme.textMuted }]} />
              <View style={[s.menuLine, { backgroundColor: theme.textMuted }]} />
              <View style={[s.menuLine, { backgroundColor: theme.textMuted }]} />
            </TouchableOpacity>
          </View>
          <Text style={[s.tagline, { color: theme.textMuted }]}>{t.tagline}</Text>
          {!isOnline && (
            <View style={[s.offlineBadge, { backgroundColor: '#ff3b3015', borderColor: '#ff3b3040' }]}>
              <Text style={[s.offlineText, { color: '#ff3b30' }]}>{t.lang === 'es' ? '✈ modo sin conexión' : '✈ offline mode'}</Text>
            </View>
          )}
        </View>

        <View style={s.micArea}>
          <MicButton micState={micState} onPress={handleMicPress} bgColor={theme.bg} />
          <Animated.Text style={[s.hintText, { color: MIC_STATES[micState].color, opacity: hintOpacity }]}>{micState === 'idle' ? (HINTS_MAP[t.lang] || HINTS_ES)[hintIndex] : (t.lang === 'es' ? MIC_STATES[micState].hints_es : MIC_STATES[micState].hints_en)[emotionalHintIndex % (t.lang === 'es' ? MIC_STATES[micState].hints_es.length : MIC_STATES[micState].hints_en.length)]}</Animated.Text>
          <TouchableOpacity onPress={() => setShowInput(!showInput)}>
            <Text style={[s.orWrite, { color: theme.textSecondary }]}>{t.orWrite}</Text>
          </TouchableOpacity>
        </View>

        {(showInput || input.length > 0) && (
          <View style={s.inputContainer}>
            <TextInput
              style={[s.input, { backgroundColor: theme.bgSecondary, borderColor: theme.border, color: theme.text }]}
              placeholder={t.placeholder}
              placeholderTextColor={theme.textDisabled}
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
          <Text style={[s.sectionLabel, { color: theme.textMuted }]}>{t.toneLabel}</Text>
          <View style={s.tonesWrap}>
            {TONES.map(key => (
              <TouchableOpacity
                key={key}
                style={[s.tonePill, { borderColor: theme.border }, tone === key && { borderColor: theme.accent, backgroundColor: theme.accentLight }]}
                onPress={() => setTone(key)}
              >
                <Text style={[s.tonePillText, { color: theme.textSecondary }, tone === key && { color: theme.accent }]}>
                  {t.tones[key as keyof typeof t.tones]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {error && <View style={[s.errorBox, { backgroundColor: theme.bgSecondary }]}><Text style={[s.errorText, { color: theme.error }]}>{error}</Text></View>}

        <View style={s.mediaSection}>
          <Text style={[s.sectionLabel, { color: theme.textMuted }]}>{t.lang === 'es' ? 'adjuntar media' : 'attach media'}</Text>
          {mediaUri ? (
            <View style={s.mediaPreviewContainer}>
              {mediaType === 'image' ? (
                <Image source={{ uri: mediaUri }} style={s.mediaPreview} resizeMode="cover" />
              ) : (
                <View style={[s.mediaPreview, s.videoPreview, { backgroundColor: theme.bgSecondary }]}>
                  <Ionicons name="play-circle" size={40} color={theme.accent} />
                  <Text style={[s.videoLabel, { color: theme.textSecondary }]}>{t.lang === 'es' ? 'video adjunto' : 'video attached'}</Text>
                </View>
              )}
              <TouchableOpacity style={[s.removeMedia, { backgroundColor: theme.bgSecondary }]} onPress={handleRemoveMedia}>
                <Ionicons name="close-circle" size={22} color={theme.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={s.mediaButtons}>
              <TouchableOpacity style={[s.mediaBtn, { borderColor: theme.border, backgroundColor: theme.bgTertiary }]} onPress={() => handlePickMedia(false)}>
                <Ionicons name="images-outline" size={20} color={theme.textSecondary} />
                <Text style={[s.mediaBtnText, { color: theme.textSecondary }]}>{t.lang === 'es' ? 'Galería' : 'Gallery'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.mediaBtn, { borderColor: theme.border, backgroundColor: theme.bgTertiary }]} onPress={() => handlePickMedia(true)}>
                <Ionicons name="camera-outline" size={20} color={theme.textSecondary} />
                <Text style={[s.mediaBtnText, { color: theme.textSecondary }]}>{t.lang === 'es' ? 'Cámara' : 'Camera'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[s.generateBtn, { backgroundColor: (loading || isGenerating) ? "#2e7d52" : theme.accent }, (!input.trim() || loading || isGenerating) && s.generateBtnDisabled]}
          onPress={handleGenerate}
          disabled={!input.trim() || loading || isGenerating}
        >
          {loading
            ? <ActivityIndicator color="#ffffff" size="small" />
            : <Text style={[s.generateBtnText, { color: '#0a0a0a' }]}>{t.generate}</Text>
          }
        </TouchableOpacity>

        {recentIdeas.length > 0 && (
          <View style={s.recentSection}>
            <TouchableOpacity style={[s.recentHeader, { borderBottomColor: theme.bgTertiary }]} onPress={() => setRecentOpen(!recentOpen)}>
              <Text style={[s.recentLabel, { color: theme.textSecondary }]}>{t.recentLabel}</Text>
              <Ionicons name={recentOpen ? "chevron-up" : "chevron-down"} size={14} color={theme.textMuted} />
            </TouchableOpacity>
            <Animated.View style={{ height: recentHeight, overflow: "hidden" }}>
              {recentIdeas.slice(0, 5).map((idea, i) => (
                <View key={i} style={[s.recentItem, { borderBottomColor: theme.bgSecondary }]}>
                  <TouchableOpacity
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => { setInput(idea); setShowInput(true); setRecentOpen(false) }}
                  >
                    <Ionicons name="time-outline" size={13} color={theme.textDisabled} style={{ marginRight: 8 }} />
                    <Text style={[s.recentItemText, { color: theme.textSecondary }]} numberOfLines={1}>{idea}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeRecentIdea(idea)} style={{ padding: 4 }}>
                    <Ionicons name="close-outline" size={16} color={theme.textDisabled} />
                  </TouchableOpacity>
                </View>
              ))}
            </Animated.View>
            {recentOpen && (
              <TouchableOpacity
                style={{ paddingVertical: 10, alignItems: 'center' }}
                onPress={() => Alert.alert(
                  t.lang === 'es' ? 'Borrar historial' : 'Clear history',
                  t.lang === 'es' ? '¿Eliminar todas las ideas recientes?' : 'Delete all recent ideas?',
                  [
                    { text: t.lang === 'es' ? 'Cancelar' : 'Cancel', style: 'cancel' },
                    { text: t.lang === 'es' ? 'Borrar' : 'Delete', style: 'destructive', onPress: clearRecentIdeas }
                  ]
                )}
              >
                <Text style={{ color: theme.textMuted, fontSize: 11 }}>{t.lang === 'es' ? 'borrar todo' : 'clear all'}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={s.flowDots}>
          {[0,1,2,3].map(i => <View key={i} style={[s.flowDot, { backgroundColor: theme.bgTertiary }]} />)}
        </View>

        <View style={s.platformsRow}>
          {activePlatformKeys.slice(0, 4).map((key, i) => {
            const p = ALL_PLATFORM_ICONS[key] || ALL_PLATFORM_ICONS['twitter']
            return (
              <View key={i} style={s.platformBadge}>
                <View style={[s.platformDot, { backgroundColor: p.color + '22', borderColor: p.color + '44' }]}>
                  {p.lib === 'fa6' && <FontAwesome6 name={p.icon as any} size={18} color={p.color} />}
                  {p.lib === 'fa5' && <FontAwesome5 name={p.icon as any} size={18} color={p.color} />}
                  {p.lib === 'text' && <Text style={[s.platformLetter, { color: p.color }]}>{p.icon}</Text>}
                </View>
                <Text style={[s.platformName, { color: p.color }]}>{p.name}</Text>
              </View>
            )
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 24, paddingTop: 48 },
  header: { marginBottom: 20 },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  logo: { fontSize: 32 },
  logoAccent: { fontStyle: "italic" },
  tagline: { fontSize: 12, marginTop: 4, letterSpacing: 0.3 },
  menuBtn: { padding: 8, gap: 5, alignItems: "flex-end" },
  menuLine: { width: 22, height: 1.5, borderRadius: 2 },
  micArea: { alignItems: "center", paddingVertical: 24, marginBottom: 8 },
  micWrapper: { width: 160, height: 160, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  ring: { position: "absolute", width: 90, height: 90, borderRadius: 45 },
  micBtn: { width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center", zIndex: 10 },
  hintText: { fontSize: 13, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 },
  orWrite: { fontSize: 15, letterSpacing: 0.3, textDecorationLine: 'underline' },
  inputContainer: { marginBottom: 24 },
  input: { borderWidth: 0.5, borderRadius: 16, padding: 16, fontSize: 15, fontWeight: "300", minHeight: 90, lineHeight: 24 },
  toneSection: { marginBottom: 28 },
  tonesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4, justifyContent: 'center' },
  sectionLabel: { fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 },
  toneRow: { flexDirection: "row", gap: 8 },
  tonePill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 0.5 },
  tonePillText: { fontSize: 12 },
  errorBox: { borderRadius: 10, padding: 12, marginBottom: 16 },
  offlineBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginTop: 6 },
  offlineText: { fontSize: 11, fontWeight: '500' },
  errorText: { fontSize: 12 },
  generateBtn: { borderRadius: 14, height: 52, alignItems: "center", justifyContent: "center", marginBottom: 24 },
  generateBtnDisabled: { opacity: 0.4 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  loadingText: { fontSize: 15, fontWeight: '400', letterSpacing: 0.3 },
  generateBtnText: { fontSize: 17, fontWeight: "500" },
  recentSection: { marginBottom: 24 },
  recentHeader: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, borderBottomWidth: 0.5, gap: 8 },
  recentLabel: { fontSize: 11, letterSpacing: 2, textTransform: "uppercase" },
  recentItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 0.5 },
  recentItemText: { fontSize: 13, flex: 1 },
  flowDots: { flexDirection: "row", justifyContent: "center", gap: 6, marginBottom: 4 },
  flowDot: { width: 4, height: 4, borderRadius: 2 },
  platformsRow: { flexDirection: "row", justifyContent: "center", gap: 16, paddingVertical: 16, paddingBottom: 24 },
  platformBadge: { alignItems: "center", gap: 6 },
  platformDot: { width: 44, height: 44, borderRadius: 22, borderWidth: 0.5, alignItems: "center", justifyContent: "center" },
  platformLetter: { fontSize: 17, fontWeight: "900", letterSpacing: -0.5 },
  platformName: { fontSize: 9, letterSpacing: 0.5, textTransform: "uppercase", opacity: 0.8 },
  mediaSection: { marginBottom: 24 },
  mediaButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  mediaBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, borderWidth: 0.5 },
  mediaBtnText: { fontSize: 13 },
  mediaPreviewContainer: { marginTop: 8, position: 'relative' },
  mediaPreview: { width: '100%', height: 180, borderRadius: 12 },
  videoPreview: { alignItems: 'center', justifyContent: 'center', gap: 8 },
  videoLabel: { fontSize: 13 },
  removeMedia: { position: 'absolute', top: 8, right: 8, borderRadius: 11 },
})
