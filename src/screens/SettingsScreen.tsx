import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native'
import { useLanguage } from '../hooks/useLanguage'

export default function SettingsScreen({ navigation }: any) {
  const { t } = useLanguage()

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backBtn}>{t.back}</Text>
        </TouchableOpacity>
        <Text style={s.title}>{t.lang === 'es' ? 'configuración' : 'settings'}</Text>
        <View style={{ width: 48 }} />
      </View>
      <ScrollView contentContainerStyle={s.scroll}>

        <View style={s.section}>
          <Text style={s.sectionLabel}>{t.lang === 'es' ? 'cuenta' : 'account'}</Text>
          <TouchableOpacity style={s.row}>
            <Text style={s.rowText}>{t.lang === 'es' ? 'iniciar sesión' : 'sign in'}</Text>
            <Text style={s.rowArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.row}>
            <Text style={s.rowText}>{t.lang === 'es' ? 'crear cuenta' : 'create account'}</Text>
            <Text style={s.rowArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={s.section}>
          <Text style={s.sectionLabel}>{t.lang === 'es' ? 'plataformas' : 'platforms'}</Text>
          <TouchableOpacity style={s.row}>
            <Text style={s.rowText}>{t.lang === 'es' ? 'gestionar conexiones' : 'manage connections'}</Text>
            <Text style={s.rowArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={s.section}>
          <Text style={s.sectionLabel}>{t.lang === 'es' ? 'preferencias' : 'preferences'}</Text>
          <TouchableOpacity style={s.row}>
            <Text style={s.rowText}>{t.lang === 'es' ? 'idioma' : 'language'}</Text>
            <Text style={s.rowValue}>{t.lang === 'es' ? 'automático' : 'automatic'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.row}>
            <Text style={s.rowText}>{t.lang === 'es' ? 'tono por defecto' : 'default tone'}</Text>
            <Text style={s.rowValue}>auto</Text>
          </TouchableOpacity>
        </View>

        <View style={s.section}>
          <Text style={s.sectionLabel}>{t.lang === 'es' ? 'acerca de' : 'about'}</Text>
          <View style={s.row}>
            <Text style={s.rowText}>voxa</Text>
            <Text style={s.rowValue}>v0.1.0</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0a0a0a' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backBtn: { fontSize: 14, color: '#666' },
  title: { fontSize: 16, color: '#f0ede8' },
  scroll: { padding: 20, paddingBottom: 60 },
  section: { marginBottom: 32 },
  sectionLabel: { fontSize: 10, color: '#666', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#111', borderRadius: 12, borderWidth: 0.5, borderColor: '#1e1e1e', padding: 16, marginBottom: 8 },
  rowText: { fontSize: 14, color: '#ccc' },
  rowArrow: { fontSize: 18, color: '#444' },
  rowValue: { fontSize: 13, color: '#555' },
})
