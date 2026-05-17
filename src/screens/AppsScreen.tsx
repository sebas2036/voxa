import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Switch, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../theme'
import { useLanguage } from '../hooks/useLanguage'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { PROVIDERS, ProviderId } from '../constants/providers'
import { useOAuth } from '../hooks/useOAuth'

const ALL_APPS: { key: ProviderId; icon: string }[] = [
  { key: 'twitter',   icon: 'logo-twitter' },
  { key: 'linkedin',  icon: 'logo-linkedin' },
  { key: 'threads',   icon: 'ellipse-outline' },
  { key: 'instagram', icon: 'logo-instagram' },
  { key: 'whatsapp',  icon: 'logo-whatsapp' },
  { key: 'telegram',  icon: 'paper-plane-outline' },
  { key: 'tiktok',    icon: 'musical-notes-outline' },
  { key: 'facebook',  icon: 'logo-facebook' },
  { key: 'pinterest', icon: 'logo-pinterest' },
  { key: 'reddit',    icon: 'logo-reddit' },
]

const DEFAULT_STATE = {
  __v: 3,
  twitter: true, threads: true, instagram: true, reddit: true,
  linkedin: false, whatsapp: false, telegram: false,
  tiktok: false, facebook: false, pinterest: false,
} as Record<string, any>

function ConnectButton({ provider, theme, t }: { provider: ProviderId; theme: any; t: any }) {
  const { connected, loading, connect, disconnect } = useOAuth(provider)
  const label = connected
    ? (t.lang === 'es' ? 'desconectar' : 'disconnect')
    : (t.lang === 'es' ? 'conectar' : 'connect')
  return (
    <TouchableOpacity
      onPress={connected ? disconnect : connect}
      disabled={loading}
      style={[
        s.connectBtn,
        { borderColor: connected ? theme.accent : theme.border, backgroundColor: connected ? theme.accent + '20' : 'transparent' },
      ]}
    >
      {loading
        ? <ActivityIndicator size="small" color={theme.text} />
        : <Text style={[s.connectLbl, { color: connected ? theme.accent : theme.textSecondary }]}>{label}</Text>}
    </TouchableOpacity>
  )
}

export default function AppsScreen({ navigation }: any) {
  const theme = useTheme()
  const { t } = useLanguage()
  const [enabled, setEnabled] = useState<Record<string, boolean>>(DEFAULT_STATE)

  useEffect(() => {
    AsyncStorage.getItem('glosx_app_management').then(val => {
      if (val) {
        const saved = JSON.parse(val)
        if (saved.__v !== 3) {
          setEnabled(DEFAULT_STATE)
          AsyncStorage.setItem('glosx_app_management', JSON.stringify(DEFAULT_STATE))
        } else {
          setEnabled(saved)
        }
      } else {
        setEnabled(DEFAULT_STATE)
        AsyncStorage.setItem('glosx_app_management', JSON.stringify(DEFAULT_STATE))
      }
    })
  }, [])

  const toggle = async (key: string) => {
    const updated = { ...enabled, [key]: enabled[key] === false ? true : false }
    setEnabled(updated)
    await AsyncStorage.setItem('glosx_app_management', JSON.stringify(updated))
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
        {t.lang === 'es' ? 'Activa o desactiva las apps. Conectá las que tienen API para publicar sin abrir la app.' : 'Enable apps and connect the ones with API to publish without opening them.'}
      </Text>
      <ScrollView contentContainerStyle={s.scroll}>
        {ALL_APPS.map((app) => {
          const meta = PROVIDERS[app.key]
          return (
            <View key={app.key} style={[s.row, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
              <View style={s.iconWrap}>
                <Ionicons name={app.icon as any} size={22} color={theme.text} />
              </View>
              <View style={s.nameCol}>
                <Text style={[s.appName, { color: theme.text }]}>{meta.name}</Text>
                {meta.hasOAuth && (
                  <Text style={[s.subLbl, { color: theme.textMuted }]}>
                    {t.lang === 'es' ? 'API disponible' : 'API available'}
                  </Text>
                )}
              </View>
              {meta.hasOAuth && <ConnectButton provider={app.key} theme={theme} t={t} />}
              <Switch
                value={enabled[app.key] !== false}
                onValueChange={() => toggle(app.key)}
                trackColor={{ false: theme.bgTertiary, true: theme.accent }}
                thumbColor={enabled[app.key] !== false ? '#ffffff' : theme.textMuted}
              />
            </View>
          )
        })}
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
  nameCol: { flex: 1 },
  appName: { fontSize: 14 },
  subLbl: { fontSize: 11, marginTop: 2 },
  connectBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 0.5, minWidth: 88, alignItems: 'center' },
  connectLbl: { fontSize: 11 },
})
