'use client'

import { useState, useEffect, useRef } from 'react'

export default function Timer({ examEndsAt, serverNow, onExpire }) {
  // Compute once: how far ahead/behind the server clock is relative to local
  const offsetRef   = useRef(serverNow - Date.now())
  const onExpireRef = useRef(onExpire)
  const firedRef    = useRef(false)

  // Keep onExpire ref current so stale closure never calls old handler
  useEffect(() => { onExpireRef.current = onExpire }, [onExpire])

  const getRemaining = () =>
    Math.max(0, examEndsAt - (Date.now() + offsetRef.current))

  const [remaining, setRemaining] = useState(getRemaining)

  useEffect(() => {
    // Single stable interval — does NOT depend on `remaining` state
    // so it never gets cleared/recreated mid-countdown
    const tick = () => {
      const r = getRemaining()
      setRemaining(r)
      if (r === 0 && !firedRef.current) {
        firedRef.current = true
        clearInterval(timerId)
        onExpireRef.current?.()
      }
    }

    // Check immediately on mount (handles already-expired case)
    tick()

    const timerId = setInterval(tick, 500)
    return () => clearInterval(timerId)
  // Re-run only if the deadline itself changes (e.g. resume after reconnect)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examEndsAt])

  const totalSec  = Math.floor(remaining / 1000)
  const h         = Math.floor(totalSec / 3600)
  const m         = Math.floor((totalSec % 3600) / 60)
  const s         = totalSec % 60
  const pad       = (n) => String(n).padStart(2, '0')
  const isWarning = remaining > 0 && remaining < 5 * 60 * 1000

  if (remaining === 0) {
    return (
      <div className="px-4 py-2 rounded-lg bg-red-100 text-red-700 font-mono font-bold text-lg">
        Time&apos;s up!
      </div>
    )
  }

  return (
    <div className={`px-4 py-2 rounded-lg font-mono font-bold text-lg ${
      isWarning ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-blue-100 text-blue-800'
    }`}>
      {h > 0 && `${String(h).padStart(2, '0')}:`}
      {pad(m)}:{pad(s)}
    </div>
  )
}
