import { useState } from 'react'

export function useVoiceInput() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)

  const startRecording = async () => {
    setError(null)
    setIsRecording(true)
    setTimeout(() => {
      setIsRecording(false)
      setError('Voz disponible en build nativo. Usá texto por ahora.')
    }, 1500)
  }

  const stopRecording = () => {
    setIsRecording(false)
  }

  return { isRecording, transcript, error, startRecording, stopRecording }
}
