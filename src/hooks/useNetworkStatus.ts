import { useState, useEffect } from 'react'

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('https://www.google.com', { method: 'HEAD' })
        setIsOnline(res.ok)
      } catch {
        setIsOnline(false)
      }
    }
    check()
    const interval = setInterval(check, 10000)
    return () => clearInterval(interval)
  }, [])

  return { isOnline }
}
