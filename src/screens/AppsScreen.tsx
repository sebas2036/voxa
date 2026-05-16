import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Switch } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../theme'
import { useLanguage } from '../hooks/useLanguage'
import AsyncStorage from '@react-native-async-storage/async-storage'

const ALL_APPS = [
  { key: 'twitter',   name: 'X (Twitter)',  icon: 'logo-twitter' },
  { key: 'linkedin',  name: 'LinkedIn',     icon: 'logo-linkedin' },
  { key: 'threads',   name: 'Threads',      icon: 'ellipse-outline' },
  { key: 'instagram', name: 'Instagram',    icon: 'logo-instagram' },
  { key: 'whatsapp',  name: 'WhatsApp',     icon: 'logo-whatsapp' },
  { key: 'telegram',  name: 'Telegram',     icon: 'paper-plane-outline' },
  { key: 'tiktok',    name: 'TikTok',       icon: 'musical-notes-outline' },
  { key: 'facebook',  name: 'Facebook',     icon: 'logo-facebook' },
  { key: 'pinterest', name: 'Pinterest',    icon: 'logo-pinterest' },
  { key: 'reddit',    name: 'Reddit',       icon: 'logo-reddit' },
]

const DEFAULT_STATE = {
  __v: 3,
  twitter: true, threads: true, instagram: true, reddit: true,
  linkedin: false, whatsapp: false, telegram: false,
  tiktok: false, facebook: false, pinterest: false
}

export default function AppsScreen({ navigation }: any) {
  const theme = useTheme()
  const { t } = useLanguage()
  const [enabled, setEnabled] = useState<Record<string, boolean>>(DEFAULT_STATE)

  useEffect(() => {
    AsyncStorage.getItem('vox_app_management').then(val => {
      if (val) {
        const saved = JSON.parse(val)
        if (saved.__v !== 3) {
          setEnabled(DEFAULT_STATE)
          AsyncStorage.setItem('vox_app_management', JSON.stringify(DEFAULT_STATE))
        } else {
          setEnabled(saved)
        }
      } else {
        setEnabled(DEFAULT_STATE)
        AsyncStorage.setItem('vox_app_management', JSON.stringify(DEFAULT_STATE))
      }
    })
  }, [])

  const toggle = async (key: string) => {
    const updated = { ...enabled, [key]: enabled[key] === false ? true : false }
    setEnabled(updated)
    await AsyncStorage.setItem('vox_app_management', JSON.stringify(updated))
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[s.backBtn, { color: theme.textSecondary }]}>{t.back}</Text>
        </TouchableOpacity>
        <Text style={[s.title, { color: theme.text }]}>{t.lang === 'es' ? 'gestion de apps' : 'manage apps'}</Text>
        <View style={{ width: 48 }} />
      </View>
      <Text style={[s.hint, { color: theme.textMuted }]}>
        {t.lang === 'es' ? 'Activa o desactiva las apps que usas para publicar.' : 'Enable or disable the apps you use to publish.'}
      </Text>
      <ScrollView contentContainerStyle={s.scroll}>
        {ALL_APPS.map((app) => (
          <View key={app.key} style={[s.row, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
            <View style={s.iconWrap}>
              <Ionicons name={app.icon as any} size={22} color={theme.text} />
            </View>
            <Text style={[s.appName, { color: theme.text }]}>{app.name}</Text>
            <Switch
              value={enabled[app.key] !== false}
              onValueChange={() => toggle(app.key)}
              trackColor={{ false: theme.bgTertiary, true: theme.accent }}
              thumbColor={enabled[app.key] !== false ? '#ffffff' : theme.textMuted}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backBtn: { fontSize: 14 },
  title: { fontSize: 16 },
  hint: { fontSize: 12, paddingHorizontal: 20, marginBottom: 8, lineHeight: 18 },
  scroll: { padding: 20, paddingBottom: 60 },
  row: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 0.5, padding: 14, marginBottom: 8, gap: 12 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  appName: { flex: 1, fontSize: 14 },
})