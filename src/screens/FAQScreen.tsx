import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native'
import { useTheme } from '../theme'
import { useLanguage } from '../hooks/useLanguage'

export default function FAQScreen({ navigation }: any) {
  const theme = useTheme()
  const { t } = useLanguage()
  const [open, setOpen] = useState<number | null>(null)

  const faqs = [
    { q: t.faq1q, a: t.faq1a },
    { q: t.faq2q, a: t.faq2a },
    { q: t.faq3q, a: t.faq3a },
    { q: t.faq4q, a: t.faq4a },
    { q: t.faq5q, a: t.faq5a },
    { q: t.faq6q, a: t.faq6a },
  ]

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[s.back, { color: theme.textSecondary }]}>{t.back}</Text>
        </TouchableOpacity>
        <Text style={[s.title, { color: theme.text }]}>FAQ</Text>
        <View style={{ width: 48 }} />
      </View>
      <ScrollView contentContainerStyle={s.scroll}>
        {faqs.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[s.item, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}
            onPress={() => setOpen(open === i ? null : i)}
          >
            <View style={s.row}>
              <Text style={[s.question, { color: theme.text }]}>{item.q}</Text>
              <Text style={[s.chevron, { color: theme.textMuted }]}>{open === i ? '▲' : '▼'}</Text>
            </View>
            {open === i && (
              <Text style={[s.answer, { color: theme.textSecondary }]}>{item.a}</Text>
            )}
          </TouchableOpacity>
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
  item: { borderRadius: 12, borderWidth: 0.5, padding: 16, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  question: { fontSize: 14, fontWeight: '500', flex: 1, paddingRight: 8 },
  chevron: { fontSize: 10 },
  answer: { fontSize: 13, lineHeight: 20, marginTop: 12 },
})
