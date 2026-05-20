import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, Modal } from 'react-native'
import { useLanguage, setLanguagePreference, LanguagePreference } from '../hooks/useLanguage'
import { useTheme, setThemePreference, ThemePreference } from '../theme'
import { useAuth } from '../hooks/useAuth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'

WebBrowser.maybeCompleteAuthSession()

export default function SettingsScreen({ navigation }: any) {
  const { t, preference: langPref, lang } = useLanguage()
  const es = (a: string, b: string) => lang !== 'en' ? a : b
  const theme = useTheme()
  const { user, signOut, deleteAccount } = useAuth()

  const themeOptions: { key: ThemePreference, tKey: string }[] = [
    { key: 'auto', tKey: 'automatic' },
    { key: 'light', tKey: 'light' },
    { key: 'dark', tKey: 'dark' },
  ]

  const [showLangModal, setShowLangModal] = useState(false)
  const [twitterConnected, setTwitterConnected] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem('twitter_access_token').then(token => setTwitterConnected(!!token))
  }, [])

  const connectTwitter = async () => {
    try {
      const res = await fetch('http://192.168.0.23:3000/auth/twitter')
      const { url, codeVerifier, state } = await res.json()
      await AsyncStorage.setItem('twitter_code_verifier', codeVerifier)
      await AsyncStorage.setItem('twitter_state', state)
      const result = await WebBrowser.openAuthSessionAsync(url, 'GlosX://auth/twitter')
      if (result.type === 'success' && result.url) {
        const parsed = Linking.parse(result.url)
        const code = parsed.queryParams?.code as string
        if (code) {
          const callbackRes = await fetch('http://192.168.0.23:3000/auth/twitter/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, codeVerifier })
          })
          const data = await callbackRes.json()
          if (data.accessToken) {
            await AsyncStorage.setItem('twitter_access_token', data.accessToken)
            if (data.refreshToken) await AsyncStorage.setItem('twitter_refresh_token', data.refreshToken)
            setTwitterConnected(true)
            Alert.alert('✅', lang !== 'en' ? 'Twitter conectado' : 'Twitter connected')
          }
        }
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo conectar con Twitter')
    }
  }

  const disconnectTwitter = async () => {
    await AsyncStorage.removeItem('twitter_access_token')
    await AsyncStorage.removeItem('twitter_refresh_token')
    setTwitterConnected(false)
  }

  const langOptions: { key: LanguagePreference, tKey: string }[] = [
    { key: 'auto', tKey: 'automatic' },
  ]

  const extraLangOptions: { key: LanguagePreference, labelEs: string, labelEn: string, native: string, flag: string }[] = [
    { key: 'es', labelEs: 'Español',              labelEn: 'Spanish',              native: 'Español',    flag: '🇪🇸' },
    { key: 'en', labelEs: 'Inglés (English)',      labelEn: 'English',              native: 'English',    flag: '🇬🇧' },
    { key: 'zh', labelEs: 'Mandarín (中文)',        labelEn: 'Mandarin (中文)',       native: '中文',       flag: '🇨🇳' },
    { key: 'hi', labelEs: 'Hindi (हिन्दी)',         labelEn: 'Hindi (हिन्दी)',        native: 'हिन्दी',     flag: '🇮🇳' },
    { key: 'ar', labelEs: 'Árabe (العربية)',        labelEn: 'Arabic (العربية)',      native: 'العربية',   flag: '🇸🇦' },
    { key: 'pt', labelEs: 'Portugués (Português)', labelEn: 'Portuguese (Português)', native: 'Português', flag: '🇧🇷' },
    { key: 'ru', labelEs: 'Ruso (Русский)',         labelEn: 'Russian (Русский)',     native: 'Русский',   flag: '🇷🇺' },
    { key: 'ja', labelEs: 'Japonés (日本語)',        labelEn: 'Japanese (日本語)',      native: '日本語',    flag: '🇯🇵' },
    { key: 'fr', labelEs: 'Francés (Français)',     labelEn: 'French (Français)',     native: 'Français',  flag: '🇫🇷' },
    { key: 'de', labelEs: 'Alemán (Deutsch)',       labelEn: 'German (Deutsch)',      native: 'Deutsch',   flag: '🇩🇪' },
  ]

  const handleSignOut = () => {
    Alert.alert(
      t.signOut,
      lang !== 'en' ? '¿Querés cerrar sesión?' : 'Are you sure you want to sign out?',
      [
        { text: t.cancel, style: 'cancel' },
        { text: t.signOut, style: 'destructive', onPress: signOut }
      ]
    )
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      t.deleteAccount,
      lang !== 'en' ? 'Esta acción es irreversible. ¿Estás seguro?' : 'This action is irreversible. Are you sure?',
      [
        { text: t.cancel, style: 'cancel' },
        { 
          text: lang !== 'en' ? 'Eliminar' : 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deleteAccount()
              navigation.replace('Auth')
            } catch (e: any) {
              Alert.alert('Error', e.message)
            }
          }
        }
      ]
    )
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[s.backBtn, { color: theme.textSecondary }]}>{t.back}</Text>
        </TouchableOpacity>
        <Text style={[s.title, { color: theme.text }]}>{t.settings}</Text>
        <View style={{ width: 48 }} />
      </View>
      <ScrollView contentContainerStyle={s.scroll}>

        <View style={s.section}>
          <Text style={[s.sectionLabel, { color: theme.textMuted }]}>{t.account}</Text>
          {user ? (
            <>
              <View style={[s.row, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
                <Text style={[s.rowText, { color: theme.text }]}>{user.email}</Text>
                <View style={[s.badge, { backgroundColor: theme.accentLight, borderColor: theme.accent + '44' }]}>
                  <Text style={[s.badgeText, { color: theme.accent }]}>{t.active}</Text>
                </View>
              </View>
              <TouchableOpacity style={[s.row, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]} onPress={handleSignOut}>
                <Text style={[s.rowText, { color: theme.error }]}>{t.signOut}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.row, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]} onPress={handleDeleteAccount}>
                <Text style={[s.rowText, { color: theme.error }]}>{t.deleteAccount}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={[s.row, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]} onPress={() => navigation.navigate('Auth')}>
                <Text style={[s.rowText, { color: theme.text }]}>{t.signIn}</Text>
                <Text style={[s.rowArrow, { color: theme.textMuted }]}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.row, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]} onPress={() => navigation.navigate('Auth')}>
                <Text style={[s.rowText, { color: theme.text }]}>{t.createAccount}</Text>
                <Text style={[s.rowArrow, { color: theme.textMuted }]}>›</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={s.section}>
          <Text style={[s.sectionLabel, { color: theme.textMuted }]}>{t.platforms}</Text>
          <TouchableOpacity style={[s.row, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]} onPress={() => navigation.navigate("Apps")}>
            <Text style={[s.rowText, { color: theme.text }]}>{t.manageApps}</Text>
            <Text style={[s.rowArrow, { color: theme.textMuted }]}>›</Text>
          </TouchableOpacity>
        </View>



        <View style={s.section}>
          <Text style={[s.sectionLabel, { color: theme.textMuted }]}>{t.appearance}</Text>
          <Text style={[s.sectionHint, { color: theme.textMuted }]}>
            {t.appearanceHint}
          </Text>
          <View style={[s.selector, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
            {themeOptions.map((opt, i) => (
              <TouchableOpacity
                key={opt.key}
                style={[s.selectorOption, i < themeOptions.length - 1 && { borderRightWidth: 0.5, borderRightColor: theme.border }, theme.preference === opt.key && { backgroundColor: theme.accentLight }]}
                onPress={() => setThemePreference(opt.key)}
              >
                <Text style={[s.selectorText, { color: theme.textMuted }, theme.preference === opt.key && { color: theme.accent, fontWeight: '600' }]}>
                  {(t as any)[opt.tKey]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <Text style={[s.sectionLabel, { color: theme.textMuted }]}>{t.language}</Text>
          <Text style={[s.sectionHint, { color: theme.textMuted }]}>
            {t.languageHint}
          </Text>
          <View style={[s.selector, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
            {langOptions.map((opt, i) => (
              <TouchableOpacity
                key={opt.key}
                style={[s.selectorOption, i < langOptions.length - 1 && { borderRightWidth: 0.5, borderRightColor: theme.border }, langPref === opt.key && { backgroundColor: theme.accentLight }]}
                onPress={() => setLanguagePreference(opt.key)}
              >
                <Text style={[s.selectorText, { color: theme.textMuted }, langPref === opt.key && { color: theme.accent, fontWeight: '600' }]}>
                  {(t as any)[opt.tKey]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[s.moreLangsBtn, { borderColor: theme.border, backgroundColor: theme.bgSecondary }]}
            onPress={() => setShowLangModal(true)}
          >
            <Text style={[s.moreLangsBtnText, { color: theme.textMuted }]}>
              {extraLangOptions.find(o => o.key === langPref)
                ? `${extraLangOptions.find(o => o.key === langPref)!.flag} ${lang !== 'en' ? extraLangOptions.find(o => o.key === langPref)!.labelEs : extraLangOptions.find(o => o.key === langPref)!.labelEn}`
                : (lang !== 'en' ? '⊕ idiomas' : '⊕ languages')}
            </Text>
          </TouchableOpacity>

          <Modal visible={showLangModal} transparent animationType="slide" onRequestClose={() => setShowLangModal(false)}>
            <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setShowLangModal(false)}>
              <TouchableOpacity activeOpacity={1} style={[s.modal, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
                <View style={s.modalHeader}>
                  <Text style={[s.modalTitle, { color: theme.text }]}>{lang !== 'en' ? '＋ idiomas' : '＋ languages'}</Text>
                  <TouchableOpacity onPress={() => setShowLangModal(false)}>
                    <Text style={[{ color: theme.textMuted, fontSize: 16 }]}>✕</Text>
                  </TouchableOpacity>
                </View>
                {extraLangOptions.map(opt => (
                  <TouchableOpacity
                    key={opt.key}
                    style={[s.modalRow, { borderBottomColor: theme.border }, langPref === opt.key && { backgroundColor: theme.accentLight }]}
                    onPress={() => { setLanguagePreference(opt.key); setShowLangModal(false) }}
                  >
                    <Text style={s.modalFlag}>{opt.flag}</Text>
                    <Text style={[s.modalLangName, { color: theme.text }]}>{lang !== 'en' ? opt.labelEs : opt.labelEn}</Text>
                    {langPref === opt.key && <Text style={[{ color: theme.accent, fontSize: 16 }]}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
        </View>

        <View style={s.section}>
          <Text style={[s.sectionLabel, { color: theme.textMuted }]}>{t.about}</Text>
          <View style={[s.row, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
            <Text style={[s.rowText, { color: theme.text }]}>GlosX</Text>
            <Text style={[s.rowValue, { color: theme.textMuted }]}>v0.1.0</Text>
          </View>
          <TouchableOpacity style={[s.row, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]} onPress={() => navigation.navigate('Terms')}>
            <Text style={[s.rowText, { color: theme.text }]}>{t.terms}</Text>
            <Text style={[s.rowArrow, { color: theme.textMuted }]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.row, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]} onPress={() => Linking.openURL('mailto:Glosx@outlook.com?subject=GlosX%20soporte')}>
            <Text style={[s.rowText, { color: theme.text }]}>{lang !== 'en' ? 'Contacto y soporte' : 'Contact & support'}</Text>
            <Text style={[s.rowArrow, { color: theme.textMuted }]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.row, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]} onPress={() => navigation.navigate('Privacy')}>
            <Text style={[s.rowText, { color: theme.text }]}>{lang !== 'en' ? 'Política de privacidad' : 'Privacy policy'}</Text>
            <Text style={[s.rowArrow, { color: theme.textMuted }]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.row, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]} onPress={() => navigation.navigate('FAQ')}>
            <Text style={[s.rowText, { color: theme.text }]}>FAQ</Text>
            <Text style={[s.rowArrow, { color: theme.textMuted }]}>›</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backBtn: { fontSize: 14 },
  title: { fontSize: 16 },
  scroll: { padding: 20, paddingBottom: 60 },
  section: { marginBottom: 16 },
  sectionLabel: { fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
  sectionHint: { fontSize: 12, lineHeight: 18, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, borderWidth: 0.5, padding: 16, marginBottom: 8 },
  rowText: { fontSize: 14 },
  rowArrow: { fontSize: 18 },
  rowValue: { fontSize: 13 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 0.5 },
  badgeText: { fontSize: 11, fontWeight: '500' },
  selector: { flexDirection: 'row', borderRadius: 12, borderWidth: 0.5, overflow: 'hidden' },
  selectorOption: { flex: 1, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  selectorText: { fontSize: 13 },
  moreLangsBtn: { borderRadius: 12, borderWidth: 0.5, padding: 14, marginTop: 8, alignItems: 'center' },
  moreLangsBtnText: { fontSize: 13 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modal: { borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 0.5, padding: 20, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 16, fontWeight: '500' },
  modalRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5, gap: 12, paddingHorizontal: 4, borderRadius: 8 },
  modalFlag: { fontSize: 22 },
  modalLangName: { flex: 1, fontSize: 15 },
})
