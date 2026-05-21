import React, { useState, useEffect, useRef } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, Switch, TextInput, ActivityIndicator, Modal, Animated
} from 'react-native'
import { generateSinglePlatform } from '../services/glosx.service'
import { getStyleProfile, buildStyleContext } from '../services/styleMemory'
import { useGlosXStore } from '../store/glosx.store'
import { Image } from 'react-native'
import { FilteredImage, FilterKey } from '../components/PhotoFilterStrip'
import { useLanguage } from '../hooks/useLanguage'
import { useTheme } from '../theme'
import { PLATFORMS, publishToAll } from '../utils/deeplinks'
import { trackEdit, trackPlatform } from '../services/voiceProfile'
import { updateStyleProfile } from '../services/styleMemory'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'
import { AnimatedDots } from '../components/AnimatedDots'
import { PlatformCard } from '../components/PlatformCard'
import { SkeletonCard } from '../components/SkeletonCard'
import { applyTextStyle, STYLE_OPTIONS, TextStyleType } from '../utils/textStyles'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import { usePublish } from '../hooks/usePublish'
import { useExtraPlatforms } from '../hooks/useExtraPlatforms'

const ALL_EXTRA = [
  { key: 'linkedin', name: 'LinkedIn', color: '#4a9eff' },
  { key: 'whatsapp', name: 'WhatsApp', color: '#25D366' },
  { key: 'telegram', name: 'Telegram', color: '#2AABEE' },
  { key: 'tiktok', name: 'TikTok', color: '#333333' },
  { key: 'facebook', name: 'Facebook', color: '#1877F2' },
  { key: 'pinterest', name: 'Pinterest', color: '#E60023' },
]


const PLATFORM_EMOJIS: Record<string, string[]> = {
  twitter:   ['🔥', '💡', '✨', '🎯', '😤', '👀', '🧵', '💬'],
  instagram: ['🌿', '🌅', '💫', '🙌', '❤️', '📸', '✨', '🌸'],
  reddit:    ['🤔', '💬', '👀', '🧠', '📌', '⬆️', '🎭', '💎'],
  linkedin:  ['💼', '🚀', '📈', '🤝', '✅', '💡', '🎯', '🌟'],
  threads:   ['✨', '💭', '🌀', '🔮', '💫', '🎨', '🌊', '🦋'],
  tiktok:    ['🎵', '🔥', '💃', '🎬', '✨', '😂', '❤️', '🚀'],
  facebook:  ['❤️', '😊', '🙌', '💪', '🎉', '👏', '🌟', '💬'],
  whatsapp:  ['👋', '😊', '🙏', '❤️', '✅', '🎉', '💪', '🌟'],
  telegram:  ['📢', '💬', '🔔', '✨', '🚀', '💡', '🎯', '📌'],
  pinterest: ['📌', '🌸', '✨', '💫', '🎨', '🌿', '💕', '🏡'],
}

export default function ReviewScreen({ navigation }: any) {
  const { result, reset, updatePlatformContent, progressivePlatforms, mediaUri, mediaType, mediaFilter } = useGlosXStore()
  const { t } = useLanguage()
  const theme = useTheme()
  const [enabled, setEnabled] = useState<Record<string, boolean>>({ twitter: true, threads: true, instagram: true, reddit: true })
  const [expanded, setExpanded] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [regenerating, setRegenerating] = useState<string | null>(null)
  const [editTexts, setEditTexts] = useState<Record<string, string>>({})
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  const { extraPlatforms, setExtraPlatforms, extraContents, setExtraContents, loadingExtra, generateExtraContent } = useExtraPlatforms(result, t)
  const { publishing, published, setPublished, handlePublish } = usePublish({
    result, extraContents, enabled, extraPlatforms, PLATFORMS, reset, navigation, t, showOnboarding, setShowOnboarding
  })
  const [appMgmt, setAppMgmt] = useState<Record<string, boolean>>({})
  const [extraTextStyles, setExtraTextStyles] = useState<Record<string, string>>({})

  const firstExpanded = useRef(false)
  useEffect(() => {
    if (firstExpanded.current) return
    const firstDone = Object.entries(progressivePlatforms).find(([, status]) => status === 'done')
    if (firstDone) {
      setExpanded(firstDone[0])
      firstExpanded.current = true
    }
  }, [progressivePlatforms])

  React.useEffect(() => {
    if (!result) navigation.navigate('Capture')
  }, [result])

  React.useEffect(() => {
    AsyncStorage.getItem('glosx_app_management').then(appVal => {
      const mgmt = appVal ? JSON.parse(appVal) : {}
      setEnabled({
        twitter:   mgmt.twitter   !== false,
        threads:   mgmt.threads   !== false,
        instagram: mgmt.instagram !== false,
        reddit:    mgmt.reddit    !== false,
      })
      setAppMgmt(mgmt)
    })
  }, [])

  // No persistimos el estado de switches — siempre arrancan ON al generar nuevo contenido



  if (!result) return null

  const activeCount = PLATFORMS.filter(p => enabled[p.key]).length +
    extraPlatforms.filter(p => enabled[p.key] !== false && extraContents[p.key]).length




  const activePlatformsList = [
    ...PLATFORMS.filter(p => enabled[p.key]),
    ...extraPlatforms.filter(p => enabled[p.key] !== false)
  ]

  const isProgressive = Object.keys(progressivePlatforms).length > 0
  const allDone = isProgressive
    ? Object.values(progressivePlatforms).every(s => s === 'done' || s === 'error')
    : true

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
          {showOnboarding && (
            <TouchableOpacity
              style={[s.onboardingBanner, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}
              onPress={() => {
                AsyncStorage.setItem('glosx_onboarding_shown', '1')
                setShowOnboarding(false)
                reset()
                navigation.navigate('Settings')
              }}
            >
              <Text style={[s.onboardingText, { color: theme.text }]}>{t.lang === 'es' ? '¿Usas otras apps? Personalizá tus plataformas' : 'Use other apps? Customize your platforms'}</Text>
              <Text style={[s.onboardingArrow, { color: theme.accent }]}>→</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    )
  }

  const handleRegenerate = async (platformKey) => {
    if (regenerating) return
    setRegenerating(platformKey)
    try {
      const sp = await getStyleProfile()
      const sc = buildStyleContext(sp) ?? undefined
      const store = useGlosXStore.getState()
      const nc_result = await generateSinglePlatform(
        platformKey, store.input,
        store.tone !== 'auto' ? store.tone : undefined,
        undefined, sc
      )
      if (store.result) store.setResult({ ...store.result, platforms: { ...store.result.platforms, [platformKey]: nc_result.content } })
    } catch {}
    setRegenerating(null)
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
        {mediaUri && (
          <View style={s.mediaPreviewWrap}>
            {mediaType === 'image' ? (
              <FilteredImage uri={mediaUri!} filter={(mediaFilter || 'original') as FilterKey} style={s.mediaPreviewImg} />
            ) : (
              <View style={[s.mediaPreviewImg, s.videoThumb, { backgroundColor: theme.bgSecondary }]}>
                <Ionicons name="play-circle" size={40} color={theme.accent} />
                <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 6 }}>{t.lang === 'es' ? 'video adjunto' : 'video attached'}</Text>
              </View>
            )}
          </View>
        )}
        {PLATFORMS.filter(p => enabled[p.key]).map(platform => {
          const pdata = result.platforms[platform.key as keyof typeof result.platforms]
          const progressStatus = progressivePlatforms[platform.key]

          if (isProgressive && (progressStatus === 'pending' || progressStatus === 'loading')) {
            return <SkeletonCard key={platform.key} platform={platform} theme={theme} />
          }

          if (!pdata?.content) return null

          const isExp = expanded === platform.key
          const isEdit = editing === platform.key

          return (
            <PlatformCard
              key={platform.key}
              platform={platform}
              pdata={pdata}
              isExpanded={isExp}
              isEditing={isEdit}
              editText={editTexts[platform.key] ?? pdata.content}
              enabled={true}
              activeCount={activeCount}
              theme={theme}
              t={t}
              onToggleExpand={() => setExpanded(isExp ? null : platform.key)}
              onToggleEdit={() => { setEditTexts(prev => ({ ...prev, [platform.key]: pdata.content })); setEditing(isEdit ? null : platform.key) }}
              onEditChange={(text: string) => { setEditTexts(prev => ({ ...prev, [platform.key]: text })); updatePlatformContent(platform.key, text) }}
              onEditBlur={() => { setEditing(null); const edited = editTexts[platform.key]; if (edited) updateStyleProfile(edited); trackEdit(pdata.content, editTexts[platform.key] || pdata.content) }}
              onToggleEnabled={() => setEnabled(prev => ({ ...prev, [platform.key]: false }))}
              onRegenerate={() => handleRegenerate(platform.key)}
              regenerating={regenerating === platform.key}
            />
          )
        })}


        {extraPlatforms.filter(p => enabled[p.key] !== false).map(platform => {
          const cnt = extraContents[platform.key] || ''
          const isLoading = loadingExtra === platform.key
          const isExp = expanded === platform.key
          const isEdit = editing === platform.key
          if (isLoading) {
            return <SkeletonCard key={platform.key} platform={platform} theme={theme} />
          }
          if (!cnt) return null
          return (
            <PlatformCard
              key={platform.key}
              platform={platform}
              pdata={{ content: cnt }}
              isExpanded={isExp}
              isEditing={isEdit}
              editText={editTexts[platform.key] ?? cnt}
              enabled={enabled[platform.key] !== false}
              activeCount={activeCount}
              theme={theme}
              t={t}
              onToggleExpand={() => setExpanded(isExp ? null : platform.key)}
              onToggleEdit={() => { setEditTexts(prev => ({ ...prev, [platform.key]: cnt })); setEditing(isEdit ? null : platform.key) }}
              onEditChange={(text: string) => { setEditTexts(prev => ({ ...prev, [platform.key]: text })); setExtraContents(prev => ({ ...prev, [platform.key]: text })) }}
              onEditBlur={() => setEditing(null)}
              onToggleEnabled={() => { if (activeCount <= 1) return; setEnabled(prev => ({ ...prev, [platform.key]: !prev[platform.key] })) }}
              onRegenerate={() => handleRegenerate(platform.key)}
              regenerating={regenerating === platform.key}
            />
          )
        })}

        {allDone && result.recommendation.bestPlatform ? (
          <View style={[s.recBox, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
            <Text style={[s.recText, { color: theme.accent }]}>{result.recommendation.bestPlatform} — {result.recommendation.bestDay} {result.recommendation.bestTime}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={[s.addPlatformBtn, { borderColor: theme.border, backgroundColor: theme.bgSecondary }]} onPress={() => setShowAddModal(true)}>
          <Text style={[s.addPlatformText, { color: theme.textMuted }]}>+ {t.addPlatform}</Text>
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
              ...ALL_EXTRA.filter(p => !extraPlatforms.some(ep => ep.key === p.key) || enabled[p.key] === false)
            ].map(p => (
              <TouchableOpacity
                key={p.key}
                style={[s.modalRow, { borderBottomColor: theme.border }]}
                onPress={() => {
                  const isPredefined = PLATFORMS.some(pl => pl.key === p.key)
                  const isExtraDisabled = extraPlatforms.some(ep => ep.key === p.key) && enabled[p.key] === false
                  if (isPredefined) {
                    setEnabled(prev => ({ ...prev, [p.key]: true }))
                  } else if (isExtraDisabled) {
                    setEnabled(prev => ({ ...prev, [p.key]: true }))
                    generateExtraContent(p)
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
        <Text style={[s.activeCount, { color: theme.textMuted }]}>{activeCount} {t.active}</Text>
        <TouchableOpacity
          style={[s.publishBtn, { backgroundColor: theme.accent }, (activeCount === 0 || publishing || !allDone) && { opacity: 0.4 }]}
          onPress={handlePublish}
          disabled={activeCount === 0 || publishing || !allDone}
        >
          <Text style={[s.publishBtnText, { color: '#0a0a0a' }]}>
            {publishing ? (t.lang === 'es' ? 'compartiendo...' : 'sharing...') : !allDone ? (t.lang === 'es' ? 'creando...' : 'creating...') : t.publishNow}
          </Text>
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
  editTopBtn: { alignSelf: 'flex-start', marginBottom: 12, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, borderWidth: 0.5 },
  editTopBtnText: { fontSize: 12, fontWeight: '600' },
  recBox: { borderRadius: 12, borderWidth: 0.5, padding: 14, marginBottom: 10 },
  recText: { fontSize: 12, lineHeight: 18 },
  emojiBar: { marginBottom: 8, marginTop: 4 },
  emojiBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  emojiText: { fontSize: 20 },
  addPlatformBtn: { borderRadius: 16, borderWidth: 0.5, borderStyle: 'dashed', padding: 16, marginTop: 4, alignItems: 'center' },
  addPlatformText: { fontSize: 13, letterSpacing: 0.5 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 36, flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 0.5 },
  activeCount: { fontSize: 12 },
  publishBtn: { height: 44, borderRadius: 30, paddingHorizontal: 48, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  publishBtnText: { fontSize: 18, fontWeight: '300', fontStyle: 'italic', letterSpacing: 3 },
  styleBar: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  styleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'transparent' },
  styleBtnText: { fontSize: 13 },
  skeletonLine: { height: 11, borderRadius: 6, width: '100%' },
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
  onboardingBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14, borderWidth: 0.5, marginHorizontal: 24 },
  onboardingText: { fontSize: 13, flex: 1 },
  onboardingArrow: { fontSize: 18, marginLeft: 8 },
  mediaPreviewWrap: { marginBottom: 16, borderRadius: 16, overflow: 'hidden' },
  mediaPreviewImg: { width: '100%', height: 200, borderRadius: 16 },
  videoThumb: { alignItems: 'center', justifyContent: 'center' },
})