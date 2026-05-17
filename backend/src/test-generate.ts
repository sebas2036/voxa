import * as dotenv from 'dotenv'


import { generateContent } from './services/ai.service'

async function run() {
  console.log('🎙  GlosX — Test de generación real')
  console.log('===================================\n')

  console.log('🇦🇷  Test español...')
  const es = await generateContent('La IA no reemplaza la creatividad, la amplifica. El problema no es la herramienta, es creer que la herramienta piensa por vos.')
  console.log('Idioma detectado:', es.detectedLanguage)
  console.log('Tema:', es.analysis.topic)
  console.log('\n--- X ---\n', es.platforms.twitter.content)
  console.log('\n--- LinkedIn ---\n', es.platforms.linkedin.content)
  console.log('\n--- Threads ---\n', es.platforms.threads.content)
  console.log('\n--- Instagram ---\n', es.platforms.instagram.content)
  console.log('Hashtags:', es.platforms.instagram.hashtags.join(' '))

  console.log('\n\n🇺🇸  Test English...')
  const en = await generateContent('Consistency beats motivation every time. Motivation is a feeling, consistency is a system. Build the system.')
  console.log('Detected language:', en.detectedLanguage)
  console.log('Topic:', en.analysis.topic)
  console.log('\n--- X ---\n', en.platforms.twitter.content)
  console.log('\n--- LinkedIn ---\n', en.platforms.linkedin.content)
  console.log('\n--- Threads ---\n', en.platforms.threads.content)
  console.log('\n--- Instagram ---\n', en.platforms.instagram.content)
  console.log('Hashtags:', en.platforms.instagram.hashtags.join(' '))

  console.log('\n\n✓ Core IA funcionando')
}

run().catch(console.error)
