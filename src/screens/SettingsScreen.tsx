import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native'
import { useLanguage } from '../hooks/useLanguage'
import { useTheme, ThemePreference } from '../theme'
import { setThemePreference } from '../theme'

export default function SettingsScreen({ navigation }: any) {
  const { t } = useLanguage()
  const theme = useTheme()

  const themeOptions: { key: ThemePreference, labelEs: string, labelEn: string }[] = [
    { key: 'auto', labelEs: 'automático', labelEn: 'automatic' },
    { key: 'light', labelEs: 'claro', labelEn: 'light' },
    { key: 'dark', labelEs: 'oscuro', labelEn: 'dark' },
  ]

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
          <TouchableOpacity style={[s.row, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]} onPress={() => navigation.navigate('Auth')}>
            <Text style={[s.rowText, { color: theme.text }]}>{t.lang === 'es' ? 'iniciar sesión' : 'sign in'}</Text>
            <Text style={[s.rowArrow, { color: theme.textMuted }]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.row, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]} onPress={() => navigation.navigate('Auth')}>
            <Text style={[s.rowText, { color: theme.text }]}>{t.lang === 'es' ? 'crear cuenta' : 'create account'}</Text>
            <Text style={[s.rowArrow, { color: theme.textMuted }]}>›</Text>
          </TouchableOpacity>
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
            {t.lang === 'es' 
              ? 'Automático sigue el modo del sistema. Podés forzar oscuro si preferís ese estilo.'
              : 'Auto follows your system setting. Force dark mode if you prefer that style.'
            }
          </Text>
          <View style={[s.themeSelector, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
            {themeOptions.map((opt, i) => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  s.themeOption,
                  i < themeOptions.length - 1 && { borderRightWidth: 0.5, borderRightColor: theme.border },
                  theme.preference === opt.key && { backgroundColor: theme.accentLight }
                ]}
                onPress={() => setThemePreference(opt.key)}
              >
                <Text style={[
                  s.themeOptionText,
                  { color: theme.textMuted },
                  theme.preference === opt.key && { color: theme.accent, fontWeight: '600' }
                ]}>
                  {t.lang === 'es' ? opt.labelEs : opt.labelEn}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <Text style={[s.sectionLabel, { color: theme.textMuted }]}>{t.lang === 'es' ? 'idioma' : 'language'}</Text>
          <View style={[s.row, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
            <Text style={[s.rowText, { color: theme.text }]}>{t.lang === 'es' ? 'idioma' : 'language'}</Text>
            <Text style={[s.rowValue, { color: theme.textMuted }]}>{t.lang === 'es' ? 'automático' : 'automatic'}</Text>
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
  themeSelector: { flexDirection: 'row', borderRadius: 12, borderWidth: 0.5, overflow: 'hidden' },
  themeOption: { flex: 1, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  themeOptionText: { fontSize: 13 },
})
