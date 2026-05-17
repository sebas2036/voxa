import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../hooks/useLanguage'
import { useTheme } from '../theme'

export default function AuthScreen({ navigation }: any) {
  const { t } = useLanguage()
  const theme = useTheme()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleAuth = async () => {
    setError(null)
    setSuccess(null)
    if (!email.trim() || !password.trim()) {
      setError(t.lang === 'es' ? 'Completá todos los campos' : 'Please fill all fields')
      return
    }
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigation.replace('Capture')
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccess(t.checkEmail)
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.container}>
        <View style={s.header}>
          <Text style={[s.logo, { color: theme.text }]}>Glos<Text style={[s.logoAccent, { color: theme.accent }]}>X</Text></Text>
          <Text style={[s.tagline, { color: theme.textMuted }]}>{t.tagline}</Text>
        </View>
        <View style={s.form}>
          <Text style={[s.formTitle, { color: theme.text }]}>
            {mode === 'login' ? t.signIn : t.createAccount}
          </Text>
          <TextInput
            style={[s.input, { backgroundColor: theme.bgSecondary, borderColor: theme.border, color: theme.text }]}
            placeholder="email"
            placeholderTextColor={theme.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={[s.input, { backgroundColor: theme.bgSecondary, borderColor: theme.border, color: theme.text }]}
            placeholder={t.password}
            placeholderTextColor={theme.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {error && <Text style={[s.errorText, { color: theme.error }]}>{error}</Text>}
          {success && <Text style={[s.successText, { color: theme.success }]}>{success}</Text>}
          <TouchableOpacity style={[s.btn, { backgroundColor: theme.accent }, loading && s.btnDisabled]} onPress={handleAuth} disabled={loading}>
            {loading
              ? <ActivityIndicator color={theme.bg} />
              : <Text style={[s.btnText, { color: theme.bg }]}>{mode === 'login' ? t.enter : t.createAccount}</Text>
            }
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null) }}>
            <Text style={[s.switchText, { color: theme.textMuted }]}>
              {mode === 'login' ? t.noAccount : t.haveAccount}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.replace('Capture')} style={s.skipBtn}>
            <Text style={[s.skipText, { color: theme.textMuted }]}>{t.continueWithout}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 48 },
  logo: { fontSize: 42 },
  logoAccent: { fontStyle: 'italic' },
  tagline: { fontSize: 13, marginTop: 6 },
  form: { gap: 12 },
  formTitle: { fontSize: 22, marginBottom: 8 },
  input: { borderWidth: 0.5, borderRadius: 14, padding: 16, fontSize: 15 },
  errorText: { fontSize: 12, textAlign: 'center' },
  successText: { fontSize: 12, textAlign: 'center' },
  btn: { borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.5 },
  btnText: { fontSize: 16, fontWeight: '500' },
  switchText: { fontSize: 13, textAlign: 'center', marginTop: 8 },
  skipBtn: { marginTop: 16, alignItems: 'center' },
  skipText: { fontSize: 12 },
})
