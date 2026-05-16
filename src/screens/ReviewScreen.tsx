import React, { useState, useEffect, useRef } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, Switch, TextInput, ActivityIndicator, Modal, Animated
} from 'react-native'
import { useVoxStore } from '../store/vox.store'
import { useLanguage } from '../hooks/useLanguage'
import { useTheme } from '../theme'
import { PLATFORMS as PLATFORM_CONFIGS, publishToAll } from '../utils/deeplinks'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'

const ALL_EXTRA = [
  { key: 'linkedin', name: 'LinkedIn', color: '#4a9eff' },
  { key: 'whatsapp', name: 'WhatsApp', color: '#25D366' },
  { key: 'telegram', name: 'Telegram', color: '#2AABEE' },
  { key: 'tiktok', name: 'TikTok', color: '#333333' },
  { key: 'facebook', name: 'Facebook', color: '#1877F2' },
  { key: 'pinterest', name: 'Pinterest', color: '#E60023' },
]

const PLATFORMS = PLATFORM_CONFIGS

function SkeletonCard({ platform, theme }: { platform: any; theme: any }) {
  const anim = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start()
    return () => anim.stopAnimation()
  }, [])

  return (
    <View style={[s.card, { backgroundColor: platform.color + '0A', borderColor: platform.color + '40', borderWidth: 1.5 }]}>
      <View style={s.cardHeader}>
        <View style={[s.dot, { backgroundColor: platform.color + '60' }]} />
        <Text style={[s.platformName, { color: theme.text, fontWeight: '600', opacity: 0.5 }]}>{platform.name}</Text>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <ActivityIndicator size="small" color={platform.color} />
          <Text style={{ color: platform.color, fontSize: 11, opacity: 0.8 }}>generando...</Text>
        </View>
      </View>
      <View style={{ paddingHorizontal: 14, paddingBottom: 16, gap: 8 }}>
        <Animated.View style={[s.skeletonLine, { backgroundColor: platform.color + '20', opacity: anim }]} />
        <Animated.View style={[s.skeletonLine, { width: '75%', backgroundColor: platform.color + '20', opacity: anim }]} />
        <Animated.View style={[s.skeletonLine, { width: '55%', backgroundColor: platform.color + '20', opacity: anim }]} />
      </View>
    </View>
  )
}

function PlatformCard({ platform, pdata, isExpanded, isEditing, editText, enabled, activeCount, onToggleExpand, onToggleEdit, onEditChange, onEditBlur, onToggleEnabled, theme, t }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(12)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start()
  }, [])

  const hashtags = 'hashtags' in pdata ? (pdata as any).hashtags || [] : []

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={[s.card, { backgroundColor: platform.color + '15', borderColor: platform.color, borderWidth: 1.5 }]}>
        <TouchableOpacity style={s.cardHeader} onPress={onToggleExpand}>
          <View style={[s.dot, { backgroundColor: platform.color }]} />
          <Text style={[s.platformName, { color: theme.text, fontWeight: '600' }]}>{platform.name}</Text>
          {!isExpanded && (
            <Text style={[s.preview, { color: theme.textMuted }]} numberOfLines={1}>
              {pdata.content.slice(0, 35)}...
            </Text>
          )}
          <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={theme.textSecondary} style={{ marginRight: 2 }} />
          <Switch
            value={enabled}
            onValueChange={() => { if (activeCount <= 1) return; onToggleEnabled() }}
            trackColor={{ false: theme.bgTertiary, true: platform.color + '44' }}
            thumbColor={platform.color}
            style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
          />
        </TouchableOpacity>
        {isExpanded && (
          <View style={s.cardBody}>
            <View style={[s.divider, { backgroundColor: theme.border }]} />
            <TouchableOpacity style={[s.editTopBtn, { borderColor: theme.border }]} onPress={onToggleEdit}>
              <Text style={[s.editTopBtnText, { color: isEditing ? theme.accent : theme.textSecondary }]}>{isEditing ? t.save : t.edit}</Text>
            </TouchableOpacity>
            {isEditing ? (
              <TextInput
                style={[s.editInput, { color: theme.text, borderColor: theme.border }]}
                value={editText}
                onChangeText={onEditChange}
                multiline autoFocus
                onBlur={onEditBlur}
              />
            ) : (
              <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                <Text style={[s.content, { color: theme.text }]}>{pdata.content}</Text>
                {hashtags.length > 0 && <Text style={[s.hashtags, { color: theme.accent + '66' }]}>{hashtags.join(' ')}</Text>}
              </ScrollView>
            )}
          </View>
        )}
      </View>
    </Animated.View>
  )
}

export default function ReviewScreen({ navigation }: any) {
  const { result, reset, updatePlatformContent, progressivePlatforms } = useVoxStore()
  const { t } = useLanguage()
  const theme = useTheme()
  const [enabled, setEnabled] = useState<Record<string, boolean>>({ twitter: true, threads: true, instagram: true, reddit: true })
  const [expanded, setExpanded] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [editTexts, setEditTexts] = useState<Record<string, string>>({})
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [extraPlatforms, setExtraPlatforms] = useState<any[]>([])
  const [extraContents, setExtraContents] = useState<Record<string, string>>({})
  const [loadingExtra, setLoadingExtra] = useState<string | null>(null)
  const [appMgmt, setAppMgmt] = useState<Record<string, boolean>>({})

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
    AsyncStorage.getItem('vox_app_management').then(appVal => {
      const mgmt = appVal ? JSON.parse(appVal) : {}
      setEnabled({
        twitter:   mgmt.twitter   !== false,
        threads:   mgmt.threads   !== false,
        instagram: mgmt.instagram !== false,
        reddit:    mgmt.reddit    !== false,
      })
      setAppMgmt(mgmt)
      AsyncStorage.getItem('vox_extra_platforms').then(val => {
        const saved: any[] = val ? JSON.parse(val) : []
        const REMOVED = ['email']
        const fromMgmt = ALL_EXTRA.filter((app: any) =>
          mgmt[app.key] === true &&
          !REMOVED.includes(app.key) &&
          !saved.some((s: any) => s.key === app.key)
        )
        const merged = [...saved, ...fromMgmt].filter(
          (p: any) => mgmt[p.key] !== false && !REMOVED.includes(p.key)
        )
        setExtraPlatforms(merged)
        merged.forEach((p: any) => generateExtraContent(p))
      })
    })
  }, [])

  // No persistimos el estado de switches — siempre arrancan ON al generar nuevo contenido

  React.useEffect(() => {
    if (extraPlatforms.length > 0)
      AsyncStorage.setItem('vox_extra_platforms', JSON.stringify(extraPlatforms))
  }, [extraPlatforms])

  if (!result) return null

  const activeCount = PLATFORMS.filter(p => enabled[p.key]).length +
    extraPlatforms.filter(p => enabled[p.key] !== false && extraContents[p.key]).length

  const generateExtraContent = async (platform: any) => {
    setLoadingExtra(platform.key)
    try {
      const baseContent = result.platforms['twitter']?.content || result.platforms['linkedin']?.content || ''
      const response = await fetch('http://192.168.0.23:3000/generate-extra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: platform.name, topic: result.analysis.topic, baseContent, lang: t.lang })
      })
      const data = await response.json()
      setExtraContents(prev => ({ ...prev, [platform.key]: data.content || baseContent }))
    } catch {
      const base = result.platforms['twitter']?.content || result.platforms['linkedin']?.content || ''
      setExtraContents(prev => ({ ...prev, [platform.key]: base }))
    }
    setLoadingExtra(null)
  }

  const handlePublish = async () => {
    setPublishing(true)
    const activePredefined = PLATFORMS.filter(p => enabled[p.key])
    const activeExtra = extraPlatforms.filter(p => enabled[p.key] !== false)
    const contents: Record<string, string> = {}
    activePredefined.forEach(platform => {
      const pdata = result.platforms[platform.key as keyof typeof result.platforms]
      const hashtags = 'hashtags' in pdata ? (pdata as any).hashtags?.join(' ') : ''
      contents[platform.key] = hashtags ? `${pdata.content}\n\n${hashtags}` : pdata.content
    })
    activeExtra.forEach(platform => {
      contents[platform.key] = extraContents[platform.key] || ''
    })
    const usedKeys = [...new Set([...activePredefined.map(p => p.key), ...activeExtra.map(p => p.key)])]
    await AsyncStorage.setItem('vox_last_platforms', JSON.stringify(usedKeys))
    try {
      await Promise.race([
        publishToAll([...activePredefined, ...activeExtra], contents),
        new Promise(resolve => setTimeout(resolve, 5000))
      ])
    } catch {}
    setPublishing(false)
    setPublished(true)
    AsyncStorage.getItem('vox_onboarding_shown').then(val => {
      if (!val) setShowOnboarding(true)
    })
    setTimeout(() => { reset(); navigation.navigate('Capture') }, showOnboarding ? 4000 : 2000)
  }

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
                AsyncStorage.setItem('vox_onboarding_shown', '1')
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
              onEditBlur={() => setEditing(null)}
              onToggleEnabled={() => setEnabled(prev => ({ ...prev, [platform.key]: false }))}
            />
          )
        })}

        {extraPlatforms.filter(p => enabled[p.key] !== false).map(platform => {
          const cnt = extraContents[platform.key] || ''
          const isLoading = loadingExtra === platform.key
          const isExp = expanded === platform.key
          const isEdit = editing === platform.key
          return (
            <View key={platform.key} style={[s.card, { backgroundColor: isLoading ? '#2e7d5222' : platform.color + '15', borderColor: isLoading ? '#2e7d52' : platform.color, borderWidth: 1.5 }]}>
              <TouchableOpacity style={s.cardHeader} onPress={() => setExpanded(isExp ? null : platform.key)}>
                <View style={[s.dot, { backgroundColor: isLoading ? '#2e7d52' : platform.color }]} />
                <Text style={[s.platformName, { color: theme.text, fontWeight: '600' }]}>{platform.name}</Text>
                {isLoading
                  ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                      <ActivityIndicator size="small" color="#2e7d52" />
                      <Text style={{ color: '#2e7d52', fontSize: 12 }}>{t.lang === 'es' ? 'generando...' : 'generating...'}</Text>
                    </View>
                  : !isExp && <Text style={[s.preview, { color: theme.textMuted }]} numberOfLines={1}>{cnt.slice(0, 35)}...</Text>
                }
                <Ionicons name={isExp ? 'chevron-up' : 'chevron-down'} size={16} color={theme.textSecondary} style={{ marginRight: 2 }} />
                <Switch
                  value={enabled[platform.key] !== false}
                  onValueChange={() => { if (activeCount <= 1) return; setEnabled(prev => ({ ...prev, [platform.key]: !prev[platform.key] })) }}
                  trackColor={{ false: theme.bgTertiary, true: platform.color + '44' }}
                  thumbColor={platform.color}
                  style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
                />
              </TouchableOpacity>
              {isExp && cnt.length > 0 && !isLoading && (
                <View style={s.cardBody}>
                  <View style={[s.divider, { backgroundColor: theme.border }]} />
                  <TouchableOpacity style={[s.editTopBtn, { borderColor: theme.border }]}
                    onPress={() => { setEditTexts(prev => ({ ...prev, [platform.key]: cnt })); setEditing(isEdit ? null : platform.key) }}>
                    <Text style={[s.editTopBtnText, { color: isEdit ? theme.accent : theme.textSecondary }]}>{isEdit ? t.save : t.edit}</Text>
                  </TouchableOpacity>
                  {isEdit ? (
                    <TextInput
                      style={[s.editInput, { color: theme.text, borderColor: theme.border }]}
                      value={editTexts[platform.key]}
                      onChangeText={text => { setEditTexts(prev => ({ ...prev, [platform.key]: text })); setExtraContents(prev => ({ ...prev, [platform.key]: text })) }}
                      multiline autoFocus
                      onBlur={() => setEditing(null)}
                    />
                  ) : (
                    <Text style={[s.content, { color: theme.text }]}>{cnt}</Text>
                  )}
                </View>
              )}
            </View>
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
            {publishing ? (t.lang === 'es' ? 'compartiendo...' : 'sharing...') : !allDone ? (t.lang === 'es' ? 'generando...' : 'generating...') : t.publishNow}
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
  addPlatformBtn: { borderRadius: 16, borderWidth: 0.5, borderStyle: 'dashed', padding: 16, marginTop: 4, alignItems: 'center' },
  addPlatformText: { fontSize: 13, letterSpacing: 0.5 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 36, flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 0.5 },
  activeCount: { fontSize: 12 },
  publishBtn: { flex: 1, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  publishBtnText: { fontSize: 16, fontWeight: '500' },
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
})