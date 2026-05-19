import React, { useState, useEffect, useRef } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, Switch, TextInput, ActivityIndicator, Modal, Animated
} from 'react-native'
import { useGlosXStore } from '../store/glosx.store'
import { Image } from 'react-native'
import { useLanguage } from '../hooks/useLanguage'
import { useTheme } from '../theme'
import { PLATFORMS, publishToAll } from '../utils/deeplinks'
import { trackEdit, trackPlatform } from '../services/voiceProfile'
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


export default function ReviewScreen({ navigation }: any) {
  const { result, reset, updatePlatformContent, progressivePlatforms, mediaUri, mediaType } = useGlosXStore()
  const { t } = useLanguage()
  const theme = useTheme()
  const [enabled, setEnabled] = useState<Record<string, boolean>>({ twitter: true, threads: true, instagram: true, reddit: true })
  const [expanded, setExpanded] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [editTexts, setEditTexts] = useState<Record<string, string>>({})
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  const { extraPlatforms, setExtraPlatforms, extraContents, setExtraContents, loadingExtra, generateExtraContent } = useExtraPlatforms(result, t)
  const { publishing, published, setPublished, handlePublish } = usePublish({
    result, extraContents, enabled, extraPlatforms, PLATFORMS, reset, navigation, t, showOnboarding, setShowOnboarding
  })
  const [appMgmt, setAppMgmt] = useState<Record<string, boolean>>({})
  const [extraTextStyles, setExtraTextStyles] = useState<Record<string, string>>({})

  const applyTextStyle = (text: string, style: string) => {
    switch(style) {
      case 'bold': return text.split('').map((c: string) => {
        const m: Record<string,string> = {'A':'𝐀','B':'𝐁','C':'𝐂','D':'𝐃','E':'𝐄','F':'𝐅','G':'𝐆','H':'𝐇','I':'𝐈','J':'𝐉','K':'𝐊','L':'𝐋','M':'𝐌','N':'𝐍','O':'𝐎','P':'𝐏','Q':'𝐐','R':'𝐑','S':'𝐒','T':'𝐓','U':'𝐔','V':'𝐕','W':'𝐖','X':'𝐗','Y':'𝐘','Z':'𝐙','a':'𝐚','b':'𝐛','c':'𝐜','d':'𝐝','e':'𝐞','f':'𝐟','g':'𝐠','h':'𝐡','i':'𝐢','j':'𝐣','k':'𝐤','l':'𝐥','m':'𝐦','n':'𝐧','o':'𝐨','p':'𝐩','q':'𝐪','r':'𝐫','s':'𝐬','t':'𝐭','u':'𝐮','v':'𝐯','w':'𝐰','x':'𝐱','y':'𝐲','z':'𝐳'}
        return m[c] || c
      }).join('')
      case 'italic': return text.split('').map((c: string) => {
        const m: Record<string,string> = {'A':'𝘈','B':'𝘉','C':'𝘊','D':'𝘋','E':'𝘌','F':'𝘍','G':'𝘎','H':'𝘏','I':'𝘐','J':'𝘑','K':'𝘒','L':'𝘓','M':'𝘔','N':'𝘕','O':'𝘖','P':'𝘗','Q':'𝘘','R':'𝘙','S':'𝘚','T':'𝘛','U':'𝘜','V':'𝘝','W':'𝘞','X':'𝘟','Y':'𝘠','Z':'𝘡','a':'𝘢','b':'𝘣','c':'𝘤','d':'𝘥','e':'𝘦','f':'𝘧','g':'𝘨','h':'𝘩','i':'𝘪','j':'𝘫','k':'𝘬','l':'𝘭','m':'𝘮','n':'𝘯','o':'𝘰','p':'𝘱','q':'𝘲','r':'𝘳','s':'𝘴','t':'𝘵','u':'𝘶','v':'𝘷','w':'𝘸','x':'𝘹','y':'𝘺','z':'𝘻'}
        return m[c] || c
      }).join('')
      case 'caps': return text.toUpperCase()
      case 'mono': return text.split('').map((c: string) => {
        const m: Record<string,string> = {'A':'𝙰','B':'𝙱','C':'𝙲','D':'𝙳','E':'𝙴','F':'𝙵','G':'𝙶','H':'𝙷','I':'𝙸','J':'𝙹','K':'𝙺','L':'𝙻','M':'𝙼','N':'𝙽','O':'𝙾','P':'𝙿','Q':'𝚀','R':'𝚁','S':'𝚂','T':'𝚃','U':'𝚄','V':'𝚅','W':'𝚆','X':'𝚇','Y':'𝚈','Z':'𝚉','a':'𝚊','b':'𝚋','c':'𝚌','d':'𝚍','e':'𝚎','f':'𝚏','g':'𝚐','h':'𝚑','i':'𝚒','j':'𝚓','k':'𝚔','l':'𝚕','m':'𝚖','n':'𝚗','o':'𝚘','p':'𝚙','q':'𝚚','r':'𝚛','s':'𝚜','t':'𝚝','u':'𝚞','v':'𝚟','w':'𝚠','x':'𝚡','y':'𝚢','z':'𝚣'}
        return m[c] || c
      }).join('')
      case 'strike': return text.split('').map((c: string) => c === ' ' ? ' ' : c + '̶').join('')
      case 'wide': return text.split('').join(' ')
      default: return text
    }
  }

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
              <Image source={{ uri: mediaUri }} style={s.mediaPreviewImg} resizeMode="cover" />
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
              onEditBlur={() => { setEditing(null); trackEdit(pdata.content, editTexts[platform.key] || pdata.content) }}
              onToggleEnabled={() => setEnabled(prev => ({ ...prev, [platform.key]: false }))}
            />
          )
        })}

        {extraPlatforms.filter(p => enabled[p.key] !== false).map(platform => {
          const cnt = extraContents[platform.key] || ''
          const isLoading = loadingExtra === platform.key
          const isExp = expanded === platform.key
          const isEdit = editing === platform.key
          const extraStyle = extraTextStyles[platform.key] || 'normal'
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
                  : !isExp && <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 }}><Text style={[s.preview, { color: theme.textMuted }]} numberOfLines={1}>{cnt.slice(0, 42)}</Text><AnimatedDots color={platform.color} fallbackColor={theme.text} /></View>
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
                  <View style={s.styleBar}>
                    {([
                      { key: 'normal', label: 'Aa', fw: '400', fi: 'normal', ls: 0 },
                      { key: 'bold',   label: 'Aa', fw: '800', fi: 'normal', ls: 0 },
                      { key: 'italic', label: 'Aa', fw: '400', fi: 'italic', ls: 0 },
                      { key: 'caps',   label: 'AA', fw: '600', fi: 'normal', ls: 1 },
                      { key: 'mono',   label: 'Aa', fw: '400', fi: 'normal', ls: 0, mono: true },
                      { key: 'strike', label: 'Aa̶', fw: '400', fi: 'normal', ls: 0 },
                      { key: 'wide',   label: 'A a', fw: '400', fi: 'normal', ls: 2 },
                    ] as any[]).map(style => (
                      <TouchableOpacity
                        key={style.key}
                        style={[s.styleBtn, extraStyle === style.key && { borderColor: platform.color, backgroundColor: platform.color + '15' }]}
                        onPress={() => setExtraTextStyles(prev => ({ ...prev, [platform.key]: style.key }))}
                      >
                        <Text style={[s.styleBtnText, { color: extraStyle === style.key ? platform.color : theme.textMuted, fontWeight: style.fw, fontStyle: style.fi, letterSpacing: style.ls }, style.mono && { fontFamily: 'Courier' }]}>
                          {style.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {isEdit ? (
                    <TextInput
                      style={[s.editInput, { color: theme.text, borderColor: theme.border }]}
                      value={editTexts[platform.key]}
                      onChangeText={text => { setEditTexts(prev => ({ ...prev, [platform.key]: text })); setExtraContents(prev => ({ ...prev, [platform.key]: text })) }}
                      multiline autoFocus
                      onBlur={() => setEditing(null)}
                    />
                  ) : (
                    <Text style={[s.content, { color: theme.text }]}>{applyTextStyle(cnt, extraStyle)}</Text>
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