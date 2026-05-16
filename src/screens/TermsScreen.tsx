import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native'
import { useTheme } from '../theme'
import { useLanguage } from '../hooks/useLanguage'

export default function TermsScreen({ navigation }: any) {
  const theme = useTheme()
  const { t, lang } = useLanguage()

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[s.back, { color: theme.textSecondary }]}>{t.back}</Text>
        </TouchableOpacity>
        <Text style={[s.title, { color: theme.text }]}>{t.terms}</Text>
        <View style={{ width: 48 }} />
      </View>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={[s.section, { color: theme.text }]}>{t.termsIntro}</Text>
        <Text style={[s.heading, { color: theme.text }]}>{t.termsWeDo}</Text>
        {((t.termsWeDoItems as string) || '').split('\\n').map((item: string, i: number) => (
          <Text key={i} style={[s.body, { color: theme.textSecondary }]}>{item}</Text>
        ))}
        <Text style={[s.heading, { color: theme.text }]}>{t.termsWeDont}</Text>
        {((t.termsWeDontItems as string) || '').split('\\n').map((item: string, i: number) => (
          <Text key={i} style={[s.body, { color: theme.textSecondary }]}>{item}</Text>
        ))}
        <Text style={[s.heading, { color: theme.text }]}>{t.termsResp}</Text>
        {((t.termsRespItems as string) || '').split('\\n').map((item: string, i: number) => (
          <Text key={i} style={[s.body, { color: theme.textSecondary }]}>{item}</Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  back: { fontSize: 14 },
  title: { fontSize: 15, fontWeight: '500' },
  scroll: { padding: 20, paddingBottom: 60 },
  section: { fontSize: 14, lineHeight: 22, marginBottom: 24 },
  heading: { fontSize: 13, fontWeight: '700', marginBottom: 8, marginTop: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  body: { fontSize: 14, lineHeight: 24, marginBottom: 4 },
})
