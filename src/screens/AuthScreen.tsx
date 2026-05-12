import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../hooks/useLanguage'

export default function AuthScreen({ navigation }: any) {
  const { t } = useLanguage()
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
        setSuccess(t.lang === 'es' ? 'Revisá tu email para confirmar tu cuenta' : 'Check your email to confirm your account')
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.container}>
        <View style={s.header}>
          <Text style={s.logo}>vox<Text style={s.logoAccent}>a</Text></Text>
          <Text style={s.tagline}>{t.lang === 'es' ? 'tu idea, en todas tus redes' : 'your idea, across all your networks'}</Text>
        </View>

        <View style={s.form}>
          <Text style={s.formTitle}>
            {mode === 'login'
              ? (t.lang === 'es' ? 'iniciar sesión' : 'sign in')
              : (t.lang === 'es' ? 'crear cuenta' : 'create account')
            }
          </Text>

          <TextInput
            style={s.input}
            placeholder={t.lang === 'es' ? 'email' : 'email'}
            placeholderTextColor="#333"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={s.input}
            placeholder={t.lang === 'es' ? 'contraseña' : 'password'}
            placeholderTextColor="#333"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error && <Text style={s.errorText}>{error}</Text>}
          {success && <Text style={s.successText}>{success}</Text>}

          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#0a0a0a" />
              : <Text style={s.btnText}>
                  {mode === 'login'
                    ? (t.lang === 'es' ? 'entrar' : 'sign in')
                    : (t.lang === 'es' ? 'crear cuenta' : 'create account')
                  }
                </Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null) }}>
            <Text style={s.switchText}>
              {mode === 'login'
                ? (t.lang === 'es' ? '¿No tenés cuenta? Registrate' : "Don't have an account? Sign up")
                : (t.lang === 'es' ? '¿Ya tenés cuenta? Iniciá sesión' : 'Already have an account? Sign in')
              }
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.replace('Capture')} style={s.skipBtn}>
            <Text style={s.skipText}>
              {t.lang === 'es' ? 'continuar sin cuenta' : 'continue without account'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0a0a0a' },
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 48 },
  logo: { fontSize: 42, color: '#f0ede8' },
  logoAccent: { color: '#c8b99a', fontStyle: 'italic' },
  tagline: { fontSize: 13, color: '#555', marginTop: 6 },
  form: { gap: 12 },
  formTitle: { fontSize: 22, color: '#f0ede8', marginBottom: 8 },
  input: { backgroundColor: '#111', borderWidth: 0.5, borderColor: '#1e1e1e', borderRadius: 14, padding: 16, color: '#f0ede8', fontSize: 15 },
  errorText: { fontSize: 12, color: '#e05a4e', textAlign: 'center' },
  successText: { fontSize: 12, color: '#4caf7d', textAlign: 'center' },
  btn: { backgroundColor: '#c8b99a', borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.5 },
  btnText: { fontSize: 16, color: '#0a0a0a', fontWeight: '500' },
  switchText: { fontSize: 13, color: '#555', textAlign: 'center', marginTop: 8 },
  skipBtn: { marginTop: 16, alignItems: 'center' },
  skipText: { fontSize: 12, color: '#333' },
})
