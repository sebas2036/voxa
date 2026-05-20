import React, { useRef, useEffect, useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import {
  View, Text, TextInput, TouchableOpacity, Image, Modal,
  StyleSheet, SafeAreaView, ScrollView,
  ActivityIndicator, Animated, Easing, Alert, useWindowDimensions
} from 'react-native'
import { useGlosXStore } from '../store/glosx.store'
import { useVoiceInput } from '../hooks/useVoiceInput'
import { useLanguage } from '../hooks/useLanguage'
import { useTheme } from '../theme'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons, FontAwesome5, FontAwesome6 } from '@expo/vector-icons'
import { MicButton } from '../components/MicButton'
import { MediaIcon } from '../components/MediaIcon'
import { LanguageTicker } from '../components/LanguageTicker'
import { ALL_PLATFORM_ICONS, HINTS_MAP, MIC_STATES } from '../constants/captureConstants'
import { PhotoFilterStrip, FilteredImage, FilterKey, FILTERS } from '../components/PhotoFilterStrip'
import { useNetworkStatus } from '../hooks/useNetworkStatus'

const TONES = ['auto', 'inspiracional', 'urgente', 'cercano', 'profesional', 'reflexivo', 'provocador']

type MicState = 'idle' | 'recording' | 'thinking' | 'generating' | 'ready'

export default function CaptureScreen({ navigation }: any) {
  const { width, height } = useWindowDimensions()
  const { input, tone, loading, error, recentIdeas, setInput, setTone, generateProgressive, loadRecentIdeas, removeRecentIdea, clearRecentIdeas, setMedia, setMediaFilter } = useGlosXStore()
  const { isRecording, transcript, startRecording, stopRecording } = useVoiceInput()
  const { t } = useLanguage()
  const theme = useTheme()
  const { isOnline } = useNetworkStatus()

  const [showInput,          setShowInput]          = useState(false)
  const [devTaps,            setDevTaps]            = useState(0)
  const devTapTimer = useRef<any>(null)
  const [activePlatformKeys, setActivePlatformKeys] = useState<string[]>(['twitter','threads','instagram','reddit'])
  const [recentOpen,         setRecentOpen]         = useState(false)
  const [isGenerating,       setIsGenerating]       = useState(false)
  const [hintIndex,          setHintIndex]          = useState(0)
  const [emotionalHintIndex, setEmotionalHintIndex] = useState(0)
  const [micState,           setMicState]           = useState<MicState>('idle')
  const [mediaUri,           setMediaUri]           = useState<string | null>(null)
  const [mediaType,          setMediaType]          = useState<'image' | 'video' | null>(null)

  const openImageModal = () => setShowImageModal(true)
  const closeImageModal = () => setShowImageModal(false)
  const [activeFilter,       setActiveFilter]       = useState<FilterKey>('original')
  const [showImageModal,     setShowImageModal]     = useState(false)
  const handleFilterChange = (f: FilterKey) => { setActiveFilter(f); setMediaFilter(f) }

  const scrollRef   = useRef<any>(null)
  const taglineAnim  = useRef(new Animated.Value(0)).current
  const recentAnim  = useRef(new Animated.Value(0)).current
  const hintOpacity = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.timing(taglineAnim, { toValue: 1, duration: 1200, delay: 300, useNativeDriver: true }).start()
    loadRecentIdeas()
    AsyncStorage.getItem('glosx_last_platforms').then(val => {
      if (val) { const keys = JSON.parse(val); if (keys.length > 0) setActivePlatformKeys(keys) }
    })
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(hintOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => {
        setHintIndex(i => (i + 1) % (HINTS_MAP[t.lang]?.length ?? 3))
        Animated.timing(hintOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start()
      })
    }, 1800)
    return () => clearInterval(interval)
  }, [t.lang])

  useEffect(() => {
    if (recentOpen) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
    } else {
      setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 300)
    }
    Animated.timing(recentAnim, {
      toValue: recentOpen ? 1 : 0, duration: 250, easing: Easing.out(Easing.ease), useNativeDriver: false
    }).start()
  }, [recentOpen])

  useEffect(() => { if (transcript) { setInput(transcript); setMicState('idle') } }, [transcript])

  const handleLogoTap = () => {
    const newCount = devTaps + 1
    setDevTaps(newCount)
    if (devTapTimer.current) clearTimeout(devTapTimer.current)
    devTapTimer.current = setTimeout(() => setDevTaps(0), 2000)
    if (newCount >= 5) {
      setDevTaps(0)
      import('../services/devMonitor').then(({ enableDevMode }) => {
        enableDevMode().then(() => navigation.navigate('Dev'))
      })
    }
  }

  const handleMicPress = () => {
    if (isRecording) { stopRecording(); setMicState('thinking') }
    else { startRecording(); setMicState('recording') }
  }

  const handlePickMedia = async (useCamera: boolean) => {
    const perm = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      Alert.alert(t.lang === 'es' ? 'Permiso requerido' : 'Permission required',
        t.lang === 'es' ? 'Necesitamos acceso a tu galería/cámara.' : 'We need access to your gallery/camera.')
      return
    }
    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images','videos'], quality: 0.8, videoMaxDuration: 60 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images','videos'], quality: 0.8, videoMaxDuration: 60 })
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0]
      setMediaUri(asset.uri)
      setMediaType(asset.type === 'video' ? 'video' : 'image')
      setMedia(asset.uri, asset.type === 'video' ? 'video' : 'image')
      setActiveFilter('original')
      setMediaFilter('original')
    }
  }

  const handleRemoveMedia = () => { setMediaUri(null); setMediaType(null); setMedia(null, null) }

  const handleGenerate = async () => {
    if (!input.trim()) return
    setIsGenerating(true)
    setMicState('generating')
    await generateProgressive()
    setMicState('ready')
    setTimeout(() => { setIsGenerating(false); setMicState('idle'); navigation.navigate('Review') }, 1200)
  }

  const recentHeight = recentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.min(recentIdeas.length, 5) * 44 + 16]
  })

  const hints = HINTS_MAP[t.lang] ?? HINTS_MAP['es']
  const currentHint = micState === 'idle'
    ? hints[hintIndex % hints.length]
    : (t.lang === 'es' ? MIC_STATES[micState].hints_es : MIC_STATES[micState].hints_en)[emotionalHintIndex % (t.lang === 'es' ? MIC_STATES[micState].hints_es.length : MIC_STATES[micState].hints_en.length)]

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <View style={{ flex: 1 }}>
      <ScrollView ref={scrollRef} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>

        {!mediaUri && <View style={s.header}>
          <View style={s.headerTop}>
            <TouchableOpacity onPress={handleLogoTap} activeOpacity={0.8}>
              <Text style={[s.logo, { color: theme.text }]}>Glos<Text style={[s.logoAccent, { color: theme.accent }]}>X</Text></Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.menuBtn} onPress={() => navigation.navigate('Settings')}>
              <View style={[s.menuLine, { backgroundColor: theme.textMuted }]} />
              <View style={[s.menuLine, { backgroundColor: theme.textMuted }]} />
              <View style={[s.menuLine, { backgroundColor: theme.textMuted }]} />
            </TouchableOpacity>
          </View>
          <Animated.Text style={[s.tagline, { color: theme.text, opacity: taglineAnim, transform: [{ translateY: taglineAnim.interpolate({ inputRange: [0,1], outputRange: [6,0] }) }] }]}>{t.tagline}</Animated.Text>
          {!isOnline && (
            <View style={[s.offlineBadge, { backgroundColor: '#ff3b3015', borderColor: '#ff3b3040' }]}>
              <Text style={[s.offlineText, { color: '#ff3b30' }]}>{t.lang === 'es' ? '✈ modo sin conexión' : '✈ offline mode'}</Text>
            </View>
          )}
        </View>}

        <View style={s.micArea}>
          <MicButton micState={micState} onPress={handleMicPress} bgColor={theme.bg} />
          <Animated.Text style={[s.hintText, { color: MIC_STATES[micState].color, opacity: hintOpacity }]}>
            {currentHint}
          </Animated.Text>
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
          <View style={s.toneCarousel}>
            <TouchableOpacity onPress={() => { const i = TONES.indexOf(tone); setTone(TONES[(i-1+TONES.length)%TONES.length]) }} style={s.toneArrow}>
              <Text style={[s.toneArrowText, { color: theme.textMuted }]}>‹</Text>
            </TouchableOpacity>
            <View style={s.toneCenter}>
              {[-1, 0, 1].map(offset => {
                const i = (TONES.indexOf(tone) + offset + TONES.length) % TONES.length
                const key = TONES[i]
                const isActive = offset === 0
                return (
                  <TouchableOpacity key={key} onPress={() => setTone(key)} style={s.toneItem}>
                    <Text style={[s.toneCenterText, {
                      color: isActive ? theme.accent : theme.textMuted,
                      fontSize: isActive ? 13 : 11,
                      opacity: isActive ? 1 : 0.45,
                      fontWeight: isActive ? '500' : '300',
                    }]}>
                      {t.tones[key as keyof typeof t.tones]}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
            <TouchableOpacity onPress={() => { const i = TONES.indexOf(tone); setTone(TONES[(i+1)%TONES.length]) }} style={s.toneArrow}>
              <Text style={[s.toneArrowText, { color: theme.textMuted }]}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {error && <View style={[s.errorBox, { backgroundColor: theme.bgSecondary }]}><Text style={[s.errorText, { color: theme.error }]}>{error}</Text></View>}

        <View style={s.mediaSection}>
          <Text style={[s.mediaLabel, { color: theme.textMuted }]}>{t.lang === 'es' ? 'entrada visual' : 'visual input'}</Text>
          {mediaUri ? (
            <View style={s.mediaPreviewContainer}>
              <TouchableOpacity activeOpacity={1} onPress={() => {}} activeOpacity={0.9}>
                {mediaType === 'image'
                  ? <FilteredImage uri={mediaUri!} filter={activeFilter} style={s.mediaPreview} />
                  : <View style={[s.mediaPreview, s.videoPreview, { backgroundColor: theme.bgSecondary }]}>
                      <Ionicons name="play-circle" size={40} color={theme.accent} />
                    </View>
                }
              </TouchableOpacity>
              {mediaType === 'image' && (
                <PhotoFilterStrip activeFilter={activeFilter} onSelect={handleFilterChange} />
              )}
              <TouchableOpacity style={[s.removeMedia, { backgroundColor: theme.bgSecondary }]} onPress={handleRemoveMedia}>
                <Ionicons name="close-circle" size={22} color={theme.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={s.mediaFloating}>
              <MediaIcon icon="images-outline" label={t.lang === 'es' ? 'galería' : 'gallery'} onPress={() => handlePickMedia(false)} theme={theme} />
              <View style={s.mediaDivider} />
              <MediaIcon icon="camera-outline" label={t.lang === 'es' ? 'cámara' : 'camera'} onPress={() => handlePickMedia(true)} theme={theme} />
            </View>
          )}
        </View>

        {recentIdeas.length > 0 && (
          <View style={s.recentSection}>
            <TouchableOpacity style={[s.recentHeader, { borderBottomColor: theme.bgTertiary }]} onPress={() => setRecentOpen(!recentOpen)}>
              <Text style={[s.recentLabel, { color: theme.textSecondary }]}>{t.recentLabel}</Text>
              <Ionicons name={recentOpen ? "chevron-up" : "chevron-down"} size={14} color={theme.textMuted} />
            </TouchableOpacity>
            <Animated.View style={{ height: recentHeight, overflow: "hidden" }}>
              {recentIdeas.slice(0, 5).map((idea, i) => (
                <View key={i} style={[s.recentItem, { borderBottomColor: theme.bgSecondary }]}>
                  <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }} onPress={() => { setInput(idea); setShowInput(true); setRecentOpen(false) }}>
                    <Ionicons name="time-outline" size={13} color={theme.textDisabled} style={{ marginRight: 8 }} />
                    <Text style={[s.recentItemText, { color: theme.textSecondary }]} numberOfLines={1}>{idea}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeRecentIdea(idea)} style={{ padding: 4 }}>
                    <Ionicons name="close-outline" size={16} color={theme.textDisabled} />
                  </TouchableOpacity>
                </View>
              ))}
            </Animated.View>
          </View>
        )}

        <View style={s.bottomSection}>
          <View style={s.platformsRow}>
            {activePlatformKeys.slice(0, 4).map((key, i) => {
              const p = ALL_PLATFORM_ICONS[key] || ALL_PLATFORM_ICONS['twitter']
              return (
                <View key={i} style={s.platformBadge}>
                  <View style={[s.platformDot, { backgroundColor: p.color + '22', borderColor: p.color + '44' }]}>
                    {p.lib === 'fa6' && <FontAwesome6 name={p.icon as any} size={15} color={p.color} />}
                    {p.lib === 'fa5' && <FontAwesome5 name={p.icon as any} size={15} color={p.color} />}
                    {p.lib === 'text' && <Text style={[s.platformLetter, { color: p.color }]}>{p.icon}</Text>}
                  </View>
                  <Text style={[s.platformName, { color: p.color }]}>{p.name}</Text>
                </View>
              )
            })}
          </View>
          <LanguageTicker theme={theme} />
        </View>

      </ScrollView>
      <View style={[s.stickyFooter, { backgroundColor: theme.bg }]}>
        <TouchableOpacity
          style={[s.generateBtn, { backgroundColor: (loading || isGenerating) ? "#2e7d52" : theme.accent }, (!input.trim() || loading || isGenerating) && s.generateBtnDisabled]}
          onPress={handleGenerate}
          disabled={!input.trim() || loading || isGenerating}
        >
          {loading
            ? <ActivityIndicator color="#ffffff" size="small" />
            : <Text style={[s.generateBtnText, { color: '#000000' }]}>crear</Text>
          }
        </TouchableOpacity>
      </View>
      </View>


    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 24, paddingTop: 48, paddingBottom: 32 },
  scrollEmpty: { flexGrow: 1 },
  header: { marginBottom: 16 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logo: { fontSize: 32 },
  logoAccent: { fontStyle: 'italic' },
  tagline: { fontSize: 12, marginTop: 4, letterSpacing: 0.3, opacity: 0.8 },
  menuBtn: { padding: 8, gap: 5, alignItems: 'flex-end' },
  menuLine: { width: 22, height: 1.5, borderRadius: 2 },
  offlineBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginTop: 6 },
  offlineText: { fontSize: 11, fontWeight: '500' },
  micArea: { alignItems: 'center', paddingVertical: 20, marginBottom: 8 },
  hintText: { fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 },
  orWrite: { fontSize: 15, letterSpacing: 0.3, textDecorationLine: 'underline' },
  inputContainer: { marginBottom: 8 },
  input: { borderWidth: 0.5, borderRadius: 16, padding: 14, fontSize: 15, fontWeight: '300', minHeight: 44, lineHeight: 22 },
  toneSection: { marginBottom: 8 },
  toneCarousel: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  toneArrow: { paddingHorizontal: 12, paddingVertical: 8 },
  toneArrowText: { fontSize: 22, fontWeight: '200' },
  toneCenter: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, justifyContent: 'center' },
  toneItem: { alignItems: 'center' },
  toneCenterText: { letterSpacing: 0.3 },
  errorBox: { borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { fontSize: 12 },
  mediaSection: { marginBottom: 8 },
  mediaLabel: { fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6, textAlign: 'center' },
  mediaFloating: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 4 },
  mediaDivider: { width: 1, height: 24, backgroundColor: 'rgba(200,185,154,0.15)', marginHorizontal: 32 },
  mediaPreviewContainer: { position: 'relative' },
  mediaPreview: { width: '100%', height: 320, borderRadius: 12 },
  videoPreview: { alignItems: 'center', justifyContent: 'center' },
  removeMedia: { position: 'absolute', top: 8, right: 8, borderRadius: 11 },
  expandHint: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 6, padding: 4 },
  recentSection: { marginBottom: 16 },
  recentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderBottomWidth: 0.5, gap: 8 },
  recentLabel: { fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' },
  recentItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5 },
  recentItemText: { fontSize: 13, flex: 1 },
  bottomSection: { alignItems: 'center', paddingTop: 8, gap: 8 },
  platformsRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, opacity: 0.65 },
  platformBadge: { alignItems: 'center', gap: 5 },
  platformDot: { width: 44, height: 44, borderRadius: 22, borderWidth: 0.5, alignItems: 'center', justifyContent: 'center' },
  platformLetter: { fontSize: 15, fontWeight: '900', letterSpacing: -0.5 },
  platformName: { fontSize: 9, letterSpacing: 0.5, textTransform: 'uppercase', opacity: 0.8 },
  generateWrap: { alignItems: 'center', paddingTop: 32, paddingBottom: 16 },
  generateBtn: { borderRadius: 30, height: 44, paddingHorizontal: 48, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  generateBtnDisabled: { opacity: 0.4 },
  generateBtnText: { fontSize: 18, fontWeight: '300', fontStyle: 'italic', letterSpacing: 3 },
  modalOverlay: { flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' },
  modalClose: { position: 'absolute', top: 60, right: 20 },
})
