import { useState, useEffect } from 'react'
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition'

export function useVoiceInput() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)

  useSpeechRecognitionEvent('start', () => setIsRecording(true))
  useSpeechRecognitionEvent('end', () => setIsRecording(false))
  useSpeechRecognitionEvent('result', (event) => {
    if (event.results[0]?.transcript) {
      setTranscript(event.results[0].transcript)
    }
  })
  useSpeechRecognitionEvent('error', (event) => {
    setError(event.message)
    setIsRecording(false)
  })

  const startRecording = async () => {
    setError(null)
    setTranscript('')
    const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync()
    if (!granted) {
      setError('Permiso de micrófono denegado')
      return
    }
    ExpoSpeechRecognitionModule.start({
      lang: 'es-AR',
      interimResults: true,
      continuous: false,
    })
  }

  const stopRecording = () => {
    ExpoSpeechRecognitionModule.stop()
    setIsRecording(false)
  }

  return { isRecording, transcript, error, startRecording, stopRecording }
}
