import React, { useEffect, useState, useRef } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native'
import { useTheme } from '../theme'
import { getLogs, getMetrics, clearLogs, clearMetrics, disableDevMode, DevLog, DevMetrics } from '../services/devMonitor'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_URL } from '../constants/api'

const FILE_SIZES: Record<string, { lines: number, limit: number }> = {
  'CaptureScreen': { lines: 392, limit: 400 },
  'ReviewScreen':  { lines: 361, limit: 400 },
  'SettingsScreen':{ lines: 304, limit: 400 },
  'PlatformCard':  { lines: 159, limit: 200 },
  'EmojiPicker':   { lines: 81,  limit: 200 },
  'MicButton':     { lines: 94,  limit: 200 },
  'glosx.store':   { lines: 189, limit: 200 },
}

export default function DevScreen({ navigation }: any) {
  const theme = useTheme()
  const [logs, setLogs] = useState<DevLog[]>([])
  const [metrics, setMetrics] = useState<DevMetrics | null>(null)
  const [backendStatus, setBackendStatus] = useState<'checking' | 'ok' | 'error'>('checking')
  const [activeTab, setActiveTab] = useState<'system' | 'files' | 'metrics' | 'logs'>('system')

  useEffect(() => {
    getLogs().then(setLogs)
    getMetrics().then(setMetrics)
    fetch(API_URL + '/health')
      .then(r => r.json())
      .then(() => setBackendStatus('ok'))
      .catch(() => setBackendStatus('error'))
  }, [])

  const handleClearLogs = () => Alert.alert('Borrar logs', '¿Seguro?', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Borrar', style: 'destructive', onPress: async () => { await clearLogs(); setLogs([]) } }
  ])

  const handleClearMetrics = () => Alert.alert('Resetear métricas', '¿Seguro?', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Resetear', style: 'destructive', onPress: async () => { await clearMetrics(); getMetrics().then(setMetrics) } }
  ])

  const handleClearStorage = () => Alert.alert('⚠️ Reset total', 'Borra TODO el storage.', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Reset', style: 'destructive', onPress: async () => { await AsyncStorage.clear(); Alert.alert('✅ Listo', 'Reiniciá la app.') } }
  ])

  const handleExitDev = async () => { await disableDevMode(); navigation.goBack() }
  const statusColor = backendStatus === 'ok' ? '#1D9E75' : backendStatus === 'error' ? '#E24B4A' : '#EF9F27'

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <View style={[s.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[s.back, { color: theme.textSecondary }]}>← atras</Text>
        </TouchableOpacity>
        <Text style={[s.title, { color: theme.accent }]}>⚙ dev mode</Text>
        <TouchableOpacity onPress={handleExitDev}>
          <Text style={[s.exit, { color: '#E24B4A' }]}>salir</Text>
        </TouchableOpacity>
      </View>

      <View style={[s.tabs, { borderBottomColor: theme.border }]}>
        {(['system', 'files', 'metrics', 'logs'] as const).map(tab => (
          <TouchableOpacity key={tab} style={[s.tab, activeTab === tab && { borderBottomColor: theme.accent, borderBottomWidth: 2 }]} onPress={() => setActiveTab(tab)}>
            <Text style={[s.tabText, { color: activeTab === tab ? theme.accent : theme.textMuted }]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.content}>

        {activeTab === 'system' && (
          <View>
            <View style={[s.card, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
              <Text style={[s.cardTitle, { color: theme.textMuted }]}>BACKEND</Text>
              <View style={s.row}>
                <Text style={[s.label, { color: theme.textSecondary }]}>Status</Text>
                <View style={[s.badge, { backgroundColor: statusColor + '22' }]}>
                  <Text style={[s.badgeText, { color: statusColor }]}>{backendStatus}</Text>
                </View>
              </View>
              <View style={s.row}>
                <Text style={[s.label, { color: theme.textSecondary }]}>URL</Text>
                <Text style={[s.value, { color: theme.text }]} numberOfLines={1}>{API_URL}</Text>
              </View>
            </View>

            <View style={[s.card, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
              <Text style={[s.cardTitle, { color: theme.textMuted }]}>APP</Text>
              <View style={s.row}>
                <Text style={[s.label, { color: theme.textSecondary }]}>Bundle</Text>
                <Text style={[s.value, { color: theme.text }]}>com.sebasjasinsky.voxa</Text>
              </View>
              <View style={s.row}>
                <Text style={[s.label, { color: theme.textSecondary }]}>Versión</Text>
                <Text style={[s.value, { color: theme.text }]}>1.0.0</Text>
              </View>
              <View style={s.row}>
                <Text style={[s.label, { color: theme.textSecondary }]}>SDK</Text>
                <Text style={[s.value, { color: theme.text }]}>Expo 54</Text>
              </View>
            </View>

            <View style={[s.card, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
              <Text style={[s.cardTitle, { color: theme.textMuted }]}>ACCIONES</Text>
              <TouchableOpacity style={[s.actionBtn, { borderColor: theme.border }]} onPress={handleClearLogs}>
                <Text style={[s.actionText, { color: theme.textSecondary }]}>🗑 limpiar logs</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.actionBtn, { borderColor: theme.border }]} onPress={handleClearMetrics}>
                <Text style={[s.actionText, { color: theme.textSecondary }]}>↺ resetear métricas</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.actionBtn, { borderColor: '#E24B4A44' }]} onPress={handleClearStorage}>
                <Text style={[s.actionText, { color: '#E24B4A' }]}>⚠ reset total storage</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'files' && (
          <View>
            {Object.entries(FILE_SIZES).map(([file, { lines, limit }]) => {
              const pct = Math.round(lines / limit * 100)
              const color = pct > 100 ? '#E24B4A' : pct > 85 ? '#EF9F27' : '#1D9E75'
              return (
                <View key={file} style={[s.fileRow, { borderBottomColor: theme.border }]}>
                  <Text style={[s.fileName, { color: theme.text }]}>{file}</Text>
                  <View style={s.fileRight}>
                    <Text style={[s.fileLines, { color: theme.textMuted }]}>{lines}/{limit}</Text>
                    <View style={[s.fileDot, { backgroundColor: color }]} />
                  </View>
                </View>
              )
            })}
            <Text style={[s.note, { color: theme.textDisabled }]}>🟢 ok  🟡 cerca  🔴 refactorizar</Text>
          </View>
        )}

        {activeTab === 'metrics' && metrics && (
          <View>
            <View style={[s.card, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
              <Text style={[s.cardTitle, { color: theme.textMuted }]}>GENERACIONES</Text>
              <Text style={[s.bigNumber, { color: theme.accent }]}>{metrics.totalGenerations}</Text>
              <Text style={[s.note, { color: theme.textMuted }]}>última: {metrics.lastGeneration ? new Date(metrics.lastGeneration).toLocaleString() : 'nunca'}</Text>
            </View>
            <View style={[s.card, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
              <Text style={[s.cardTitle, { color: theme.textMuted }]}>ERRORES</Text>
              <Text style={[s.bigNumber, { color: metrics.errors > 0 ? '#E24B4A' : '#1D9E75' }]}>{metrics.errors}</Text>
            </View>
            <View style={[s.card, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
              <Text style={[s.cardTitle, { color: theme.textMuted }]}>USO POR PLATAFORMA</Text>
              {Object.entries(metrics.platformUsage).sort((a,b) => b[1]-a[1]).map(([p, count]) => (
                <View key={p} style={s.row}>
                  <Text style={[s.label, { color: theme.textSecondary }]}>{p}</Text>
                  <Text style={[s.value, { color: theme.accent }]}>{count}</Text>
                </View>
              ))}
              {Object.keys(metrics.platformUsage).length === 0 && <Text style={[s.note, { color: theme.textDisabled }]}>sin datos aún</Text>}
            </View>
          </View>
        )}

        {activeTab === 'logs' && (
          <View>
            {logs.length === 0 && <Text style={[s.note, { color: theme.textDisabled }]}>sin logs</Text>}
            {logs.map((log, i) => {
              const color = log.level === 'error' ? '#E24B4A' : log.level === 'warn' ? '#EF9F27' : theme.textMuted
              return (
                <View key={i} style={[s.logRow, { borderBottomColor: theme.border }]}>
                  <Text style={[s.logLevel, { color }]}>{log.level.toUpperCase()}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.logTag, { color: theme.accent }]}>{log.tag}</Text>
                    <Text style={[s.logMsg, { color: theme.textSecondary }]}>{log.message}</Text>
                    <Text style={[s.logTime, { color: theme.textDisabled }]}>{new Date(log.timestamp).toLocaleTimeString()}</Text>
                  </View>
                </View>
              )
            })}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 0.5 },
  back: { fontSize: 14 },
  title: { fontSize: 14, fontWeight: '600', letterSpacing: 1 },
  exit: { fontSize: 12 },
  tabs: { flexDirection: 'row', borderBottomWidth: 0.5 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  tabText: { fontSize: 11, letterSpacing: 1 },
  content: { padding: 16 },
  card: { borderRadius: 12, borderWidth: 0.5, padding: 14, marginBottom: 12 },
  cardTitle: { fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 5 },
  label: { fontSize: 13 },
  value: { fontSize: 13, fontWeight: '500' },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  bigNumber: { fontSize: 48, fontWeight: '300', textAlign: 'center', paddingVertical: 8 },
  actionBtn: { borderWidth: 0.5, borderRadius: 10, padding: 12, marginBottom: 8 },
  actionText: { fontSize: 13, textAlign: 'center' },
  fileRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 0.5 },
  fileName: { fontSize: 13, fontWeight: '500' },
  fileRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fileLines: { fontSize: 12 },
  fileDot: { width: 8, height: 8, borderRadius: 4 },
  note: { fontSize: 11, textAlign: 'center', padding: 16 },
  logRow: { flexDirection: 'row', gap: 10, paddingVertical: 10, borderBottomWidth: 0.5 },
  logLevel: { fontSize: 10, fontWeight: '700', width: 40, paddingTop: 2 },
  logTag: { fontSize: 12, fontWeight: '600' },
  logMsg: { fontSize: 12 },
  logTime: { fontSize: 10, marginTop: 2 },
})
