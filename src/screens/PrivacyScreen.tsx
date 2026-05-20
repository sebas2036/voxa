import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native'
import { useTheme } from '../theme'
import { useLanguage } from '../hooks/useLanguage'

export default function PrivacyScreen({ navigation }: any) {
  const theme = useTheme()
  const { lang } = useLanguage()

  const sections = [
    {
      title: lang === 'es' ? 'Información que recopilamos' : 'Information we collect',
      content: lang === 'es'
        ? 'GlosX recopila únicamente la información necesaria para brindarte el servicio:\n\n• Email y contraseña (cifrados via Supabase Auth)\n• Ideas y textos que ingresás para generar contenido — se envían al servidor solo durante la generación y no se almacenan permanentemente\n• Preferencias de la app (tema, idioma, plataformas activas) — guardadas localmente en tu dispositivo\n• Métricas de uso anónimas en modo desarrollador — guardadas solo en tu dispositivo'
        : 'GlosX collects only the information necessary to provide the service:\n\n• Email and password (encrypted via Supabase Auth)\n• Ideas and texts you enter to generate content — sent to the server only during generation and not permanently stored\n• App preferences (theme, language, active platforms) — stored locally on your device\n• Anonymous usage metrics in developer mode — stored only on your device'
    },
    {
      title: lang === 'es' ? 'Cómo usamos tu información' : 'How we use your information',
      content: lang === 'es'
        ? '• Tu email se usa exclusivamente para autenticación y recuperación de cuenta\n• Los textos que ingresás se procesan por IA (Anthropic Claude) para generar contenido adaptado a cada plataforma y se descartan inmediatamente después\n• Las fotos o videos que adjuntás nunca se suben a nuestros servidores\n• No vendemos ni compartimos tu información personal con terceros'
        : '• Your email is used exclusively for authentication and account recovery\n• Texts you enter are processed by AI (Anthropic Claude) and discarded immediately after\n• Photos or videos you attach are never uploaded to our servers\n• We do not sell or share your personal information with third parties'
    },
    {
      title: lang === 'es' ? 'Almacenamiento y seguridad' : 'Storage and security',
      content: lang === 'es'
        ? '• Tu cuenta está protegida por Supabase con cifrado de nivel bancario\n• Usamos HTTPS para todas las comunicaciones\n• No guardamos historial de tus generaciones en nuestros servidores'
        : '• Your account is protected by Supabase with bank-level encryption\n• We use HTTPS for all communications\n• We do not store your generation history on our servers'
    },
    {
      title: lang === 'es' ? 'Servicios de terceros' : 'Third-party services',
      content: lang === 'es'
        ? '• Supabase — autenticación (supabase.com/privacy)\n• Anthropic Claude — generación de texto (anthropic.com/privacy)\n• Railway — infraestructura del servidor\n• Redes sociales — solo si conectás tu cuenta voluntariamente'
        : '• Supabase — authentication (supabase.com/privacy)\n• Anthropic Claude — text generation (anthropic.com/privacy)\n• Railway — server infrastructure\n• Social networks — only if you voluntarily connect your account'
    },
    {
      title: lang === 'es' ? 'Tus derechos' : 'Your rights',
      content: lang === 'es'
        ? '• Podés eliminar tu cuenta desde Configuración → Cuenta → Eliminar cuenta\n• Al eliminar tu cuenta se borran todos tus datos permanentemente\n• Contacto: soporte@glosx.app'
        : '• You can delete your account from Settings → Account → Delete account\n• Deleting your account permanently removes all your data\n• Contact: support@glosx.app'
    },
    {
      title: lang === 'es' ? 'Menores de edad' : 'Minors',
      content: lang === 'es'
        ? 'GlosX no está dirigido a menores de 13 años. Si sos padre o tutor, contactanos a soporte@glosx.app.'
        : 'GlosX is not directed at children under 13. If you are a parent or guardian, contact us at support@glosx.app.'
    },
    {
      title: lang === 'es' ? 'Contacto' : 'Contact',
      content: 'soporte@glosx.app\nglosx.app'
    },
  ]

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <View style={[s.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[s.back, { color: theme.textSecondary }]}>{`← ${lang === 'es' ? 'atras' : 'back'}`}</Text>
        </TouchableOpacity>
        <Text style={[s.title, { color: theme.text }]}>{lang === 'es' ? 'Política de privacidad' : 'Privacy policy'}</Text>
        <View style={{ width: 50 }} />
      </View>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={[s.updated, { color: theme.textMuted }]}>{lang === 'es' ? 'Actualizado: mayo 2026' : 'Updated: May 2026'}</Text>
        <Text style={[s.intro, { color: theme.textSecondary }]}>
          {lang === 'es' ? 'En GlosX respetamos tu privacidad. Esta política explica qué información recopilamos, cómo la usamos y cómo la protegemos.' : 'At GlosX we respect your privacy. This policy explains what information we collect, how we use it, and how we protect it.'}
        </Text>
        {sections.map((section, i) => (
          <View key={i} style={s.section}>
            <Text style={[s.sectionTitle, { color: theme.text }]}>{section.title}</Text>
            <Text style={[s.sectionContent, { color: theme.textSecondary }]}>{section.content}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 0.5 },
  back: { fontSize: 14, width: 50 },
  title: { fontSize: 16, fontWeight: '500' },
  content: { padding: 24, paddingBottom: 48 },
  updated: { fontSize: 11, marginBottom: 8 },
  intro: { fontSize: 14, lineHeight: 22, marginBottom: 24, fontStyle: 'italic' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  sectionContent: { fontSize: 13, lineHeight: 22 },
})
