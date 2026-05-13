import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native'
import { useLanguage, setLanguagePreference, LanguagePreference } from '../hooks/useLanguage'
import { useTheme, setThemePreference, ThemePreference } from '../theme'
import { useAuth } from '../hooks/useAuth'

export default function SettingsScreen({ navigation }: any) {
  const { t, preference: langPref } = useLanguage()
  const theme = useTheme()
  const { user, signOut, deleteAccount } = useAuth()

  const themeOptions: { key: ThemePreference, labelEs: string, labelEn: string }[] = [
    { key: 'auto', labelEs: 'automático', labelEn: 'automatic' },
    { key: 'light', labelEs: 'claro', labelEn: 'light' },
    { key: 'dark', labelEs: 'oscuro', labelEn: 'dark' },
  ]

  const langOptions: { key: LanguagePreference, labelEs: string, labelEn: string }[] = [
    { key: 'auto', labelEs: 'automático', labelEn: 'automatic' },
    { key: 'es', labelEs: 'español', labelEn: 'spanish' },
    { key: 'en', labelEs: 'inglés', labelEn: 'english' },
  ]

  const handleSignOut = () => {
    Alert.alert(
      t.lang === 'es' ? 'Cerrar sesión' : 'Sign out',
      t.lang === 'es' ? '¿Querés cerrar sesión?' : 'Are you sure you want to sign out?',
      [
        { text: t.lang === 'es' ? 'Cancelar' : 'Cancel', style: 'cancel' },
        { text: t.lang === 'es' ? 'Cerrar sesión' : 'Sign out', style: 'destructive', onPress: signOut }
      ]
    )
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      t.lang === 'es' ? 'Eliminar cuenta' : 'Delete account',
      t.lang === 'es' ? 'Esta acción es irreversible. ¿Estás seguro?' : 'This action is irreversible. Are you sure?',
      [
        { text: t.lang === 'es' ? 'Cancelar' : 'Cancel', style: 'cancel' },
        { 
          text: t.lang === 'es' ? 'Eliminar' : 'Delete', 
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
          <Text style={[s.backBtn, { color: theme.textMuted }]}>{t.back}</Text>
        </TouchableOpacity>
        <Text style={[s.title, { color: theme.text }]}>{t.lang === 'es' ? 'configuración' : 'settings'}</Text>
        <View style={{ width: 48 }} />
      </View>
      <ScrollView contentContainerStyle={s.scroll}>

        <View style={s.section}>
          <Text style={[s.sectionLabel, { color: theme.textMuted }]}>{t.lang === 'es' ? 'cuenta' : 'account'}</Text>
          {user ? (
            <>
              <View style={[s.row, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
                <Text style={[s.rowText, { color: theme.text }]}>{user.email}</Text>
                <View style={[s.badge, { backgroundColor: theme.accentLight, borderColor: theme.accent + '44' }]}>
                  <Text style={[s.badgeText, { color: theme.accent }]}>{t.lang === 'es' ? 'activo' : 'active'}</Text>
                </View>
              </View>
              <TouchableOpacity style={[s.row, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]} onPress={handleSignOut}>
                <Text style={[s.rowText, { color: theme.error }]}>{t.lang === 'es' ? 'cerrar sesión' : 'sign out'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.row, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]} onPress={handleDeleteAccount}>
                <Text style={[s.rowText, { color: theme.error }]}>{t.lang === 'es' ? 'eliminar cuenta' : 'delete account'}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={[s.row, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]} onPress={() => navigation.navigate('Auth')}>
                <Text style={[s.rowText, { color: theme.text }]}>{t.lang === 'es' ? 'iniciar sesión' : 'sign in'}</Text>
                <Text style={[s.rowArrow, { color: theme.textMuted }]}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.row, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]} onPress={() => navigation.navigate('Auth')}>
                <Text style={[s.rowText, { color: theme.text }]}>{t.lang === 'es' ? 'crear cuenta' : 'create account'}</Text>
                <Text style={[s.rowArrow, { color: theme.textMuted }]}>›</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={s.section}>
          <Text style={[s.sectionLabel, { color: theme.textMuted }]}>{t.lang === 'es' ? 'plataformas' : 'platforms'}</Text>
          <TouchableOpacity style={[s.row, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
            <Text style={[s.rowText, { color: theme.text }]}>{t.lang === 'es' ? 'gestionar conexiones' : 'manage connections'}</Text>
            <Text style={[s.rowArrow, { color: theme.textMuted }]}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={s.section}>
          <Text style={[s.sectionLabel, { color: theme.textMuted }]}>{t.lang === 'es' ? 'apariencia' : 'appearance'}</Text>
          <Text style={[s.sectionHint, { color: theme.textDisabled }]}>
            {t.lang === 'es' ? 'Automático sigue el modo del sistema. Podés forzar oscuro si preferís ese estilo.' : 'Auto follows your system setting. Force dark mode if you prefer that style.'}
          </Text>
          <View style={[s.selector, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
            {themeOptions.map((opt, i) => (
              <TouchableOpacity
                key={opt.key}
                style={[s.selectorOption, i < themeOptions.length - 1 && { borderRightWidth: 0.5, borderRightColor: theme.border }, theme.preference === opt.key && { backgroundColor: theme.accentLight }]}
                onPress={() => setThemePreference(opt.key)}
              >
                <Text style={[s.selectorText, { color: theme.textMuted }, theme.preference === opt.key && { color: theme.accent, fontWeight: '600' }]}>
                  {t.lang === 'es' ? opt.labelEs : opt.labelEn}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <Text style={[s.sectionLabel, { color: theme.textMuted }]}>{t.lang === 'es' ? 'idioma' : 'language'}</Text>
          <Text style={[s.sectionHint, { color: theme.textDisabled }]}>
            {t.lang === 'es' ? 'Automático usa el idioma de tu dispositivo.' : 'Auto uses your device language.'}
          </Text>
          <View style={[s.selector, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
            {langOptions.map((opt, i) => (
              <TouchableOpacity
                key={opt.key}
                style={[s.selectorOption, i < langOptions.length - 1 && { borderRightWidth: 0.5, borderRightColor: theme.border }, langPref === opt.key && { backgroundColor: theme.accentLight }]}
                onPress={() => setLanguagePreference(opt.key)}
              >
                <Text style={[s.selectorText, { color: theme.textMuted }, langPref === opt.key && { color: theme.accent, fontWeight: '600' }]}>
                  {t.lang === 'es' ? opt.labelEs : opt.labelEn}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <Text style={[s.sectionLabel, { color: theme.textMuted }]}>{t.lang === 'es' ? 'acerca de' : 'about'}</Text>
          <View style={[s.row, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
            <Text style={[s.rowText, { color: theme.text }]}>voxa</Text>
            <Text style={[s.rowValue, { color: theme.textMuted }]}>v0.1.0</Text>
          </View>
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
  section: { marginBottom: 32 },
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
})
